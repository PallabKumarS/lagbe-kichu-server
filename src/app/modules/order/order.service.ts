import QueryBuilder from '../../builder/QueryBuilder';
import OrderModel from './order.model';
import { TOrder } from './order.interface';
import { generateOrderId } from '../../utils/generateID';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ListingModel from '../listing/listing.model';
import {
  sendPaymentConfirmationEmail,
  sendOrderStatusChangeEmail,
} from '../../utils/sendMail';
import UserModel from '../user/user.model';
import { makePaymentAsync, verifyPaymentAsync } from './order.utils';
import { TListing } from '../listing/listing.interface';
import { TUser } from '../user/user.interface';
import { broadcast } from '../../utils/websocket';

type PopulatedOrder = TOrder & {
  listingId: TListing;
  buyerId: TUser;
};

// get all orders from db (admin)
const getAllOrderFromDB = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(
    OrderModel.find({})
      .populate({
        path: 'listingId',
        localField: 'listingId',
        foreignField: 'listingId',
      })
      .populate({
        path: 'buyerId',
        localField: 'buyerId',
        foreignField: 'userId',
      })
      .populate({
        path: 'listingId.sellerId',
        localField: 'sellerId',
        foreignField: 'userId',
      }),
    query,
  )
    .filter()
    .sort()
    .paginate();

  const data = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { data, meta };
};

// create order in the db (buyer)
const createOrderIntoDB = async (payload: TOrder) => {
  try {
    payload.orderId = await generateOrderId();

    const result = await OrderModel.create(payload);

    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create order');
    }

    broadcast({
      userId: payload.buyerId,
      content:
        'Your Order has been placed successfully. Please wait for the seller to accept your order. You will receive a notification when the seller accepts your order.',
    });

    return result;
  } catch (err: any) {
    throw new Error(err);
  }
};

// get personal orders from db (buyer & seller)
const getPersonalOrderFromDB = async (
  userId: string,
  query: Record<string, unknown>,
  role: string,
) => {
  const orderQuery = new QueryBuilder(
    OrderModel.find(role === 'buyer' ? { buyerId: userId } : {})
      .populate({
        path: 'listingId',
        localField: 'listingId',
        foreignField: 'listingId',
      })
      .populate({
        path: 'buyerId',
        localField: 'buyerId',
        foreignField: 'userId',
      })
      .populate({
        path: 'listingId.sellerId',
        localField: 'sellerId',
        foreignField: 'userId',
      }),
    query,
  )
    .paginate()
    .filter()
    .sort();

  const data = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { data, meta };
};

// get single order from db (admin)
const getSingleOrderFromDB = async (orderId: string) => {
  const result = await OrderModel.findOne({ orderId })
    .populate({
      path: 'listingId',
      localField: 'listingId',
      foreignField: 'listingId',
    })
    .populate({
      path: 'buyerId',
      localField: 'buyerId',
      foreignField: 'userId',
    })
    .populate({
      path: 'listingId.sellerId',
      localField: 'sellerId',
      foreignField: 'userId',
    });

  return result;
};

// change order status from db (seller)
const changeOrderStatusIntoDB = async (
  orderId: string,
  status: { status: string },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isOrderExists = await OrderModel.findOne({ orderId });

    if (!isOrderExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }

    const result = await OrderModel.findOneAndUpdate(
      { orderId },
      { status: status.status },
      {
        new: true,
        session,
      },
    );

    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update order');
    }

    const user = await UserModel.findOne({ userId: result?.buyerId });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const listing = await ListingModel.findOne({
      listingId: result.listingId,
    });
    if (!listing) {
      throw new AppError(httpStatus.NOT_FOUND, 'Listing not found');
    }

    const info = await sendOrderStatusChangeEmail(
      user?.email,
      result?.orderId as string,
      result?.status,
    );

    broadcast({
      userId: user?.userId,
      content: `Your order status has been changed from ${isOrderExists.status} to ${result.status}. Please check your order status.`,
    });

    if (info.accepted.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Email not sent');
    }
    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(err);
  }
};

// update order from db
const updateOrderIntoDB = async (orderId: string, payload: Partial<TOrder>) => {
  try {
    const isOrderExists = await OrderModel.findOne({ orderId });

    if (!isOrderExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }
    const result = await OrderModel.findOneAndUpdate({ orderId }, payload, {
      new: true,
    });
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update order');
    }

    return result;
  } catch (err: any) {
    throw new Error(err);
  }
};

// delete order from db (admin)
const deleteOrderFromDB = async (orderId: string) => {
  const isOrderExists = await OrderModel.findOne({ orderId });

  if (!isOrderExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (isOrderExists.paymentType === 'payment') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Order already paid');
  }

  const result = await OrderModel.findOneAndDelete({ orderId });
  return result;
};

// create payment in the db (buyer)
const createPaymentIntoDB = async (orderId: string, client_ip: string) => {
  try {
    const orderData = (await OrderModel.findOne({ orderId })
      .populate({
        path: 'listingId',
        localField: 'listingId',
        foreignField: 'listingId',
      })
      .populate({
        path: 'buyerId',
        localField: 'buyerId',
        foreignField: 'userId',
      })
      .populate({
        path: 'listingId.sellerId',
        localField: 'sellerId',
        foreignField: 'userId',
      })
      .lean()
      .exec()) as unknown as PopulatedOrder;

    const shurjopayPayload = {
      amount: orderData?.price,
      order_id: orderId,
      currency: 'BDT',
      customer_name: orderData?.buyerId.name,
      customer_address: orderData?.buyerId?.address || 'N/A',
      customer_email: orderData?.buyerId.email,
      customer_phone: orderData?.buyerId?.phone || 'N/A',
      customer_city: 'N/A',
      client_ip,
    };

    const payment = await makePaymentAsync(shurjopayPayload);

    if (!payment) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create payment');
    }

    let updatedOrder: TOrder | null = null;

    if (payment?.transactionStatus) {
      updatedOrder = await OrderModel.findOneAndUpdate(
        { orderId },
        {
          $set: {
            transaction: {
              paymentId: payment.sp_order_id as string,
              transactionStatus: payment.transactionStatus,
              paymentUrl: payment.checkout_url,
            },
          },
        },
        { new: true },
      );
    }

    if (!updatedOrder) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update order');
    }

    return updatedOrder;
  } catch (err: any) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create payment');
  }
};

// verify payment from db (buyer)
const verifyPaymentFromDB = async (paymentId: string) => {
  const payment = await verifyPaymentAsync(paymentId);

  if (payment.length) {
    const updated = await OrderModel.findOneAndUpdate(
      {
        'transaction.paymentId': String(paymentId),
      },
      {
        'transaction.bankStatus': payment[0].bank_status,
        'transaction.spCode': payment[0].sp_code,
        'transaction.spMessage': payment[0].sp_message,
        'transaction.method': payment[0].method,
        'transaction.dateTime': payment[0].date_time,
        'transaction.transactionStatus': payment[0].transaction_status,
        status:
          payment[0].bank_status == 'Success'
            ? 'processing'
            : payment[0].bank_status == 'Failed'
              ? 'pending'
              : payment[0].bank_status == 'Cancel'
                ? 'cancelled'
                : 'pending',
      },
    );

    if (!updated) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update order');
    }
  }

  // if the payment is successful
  if (payment[0].bank_status === 'Success') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // check if order was placed before
      const orderExists = (await OrderModel.findOne({
        'transaction.paymentId': paymentId,
      })
        .populate({
          path: 'listingId',
          localField: 'listingId',
          foreignField: 'listingId',
        })
        .populate({
          path: 'buyerId',
          localField: 'buyerId',
          foreignField: 'userId',
        })
        .populate({
          path: 'listingId.sellerId',
          localField: 'sellerId',
          foreignField: 'userId',
        })
        .lean()
        .exec()) as unknown as PopulatedOrder;

      if (!orderExists) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Payment was not done correctly, please try again',
        );
      }

      const user = await UserModel.findOne({
        userId: orderExists?.buyerId.userId,
      });

      if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
      }

      broadcast({
        userId: user?.userId,
        content: `Your payment has been successful. Your payment id is ${orderExists?.transaction?.paymentId}. You will receive a confirmation email shortly.`,
      });

      const info = await sendPaymentConfirmationEmail(
        user?.email,
        orderExists?.orderId as string,
        orderExists?.transaction?.paymentId as string,
        orderExists?.price,
      );

      if (info.accepted.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email not sent');
      }

      session.commitTransaction();
      session.endSession();
    } catch (err: any) {
      session.abortTransaction();
      session.endSession();
      throw new Error(err);
    }
  }

  return payment[0];
};

export const OrderService = {
  getAllOrderFromDB,
  getPersonalOrderFromDB,
  getSingleOrderFromDB,
  deleteOrderFromDB,
  createOrderIntoDB,
  changeOrderStatusIntoDB,
  createPaymentIntoDB,
  verifyPaymentFromDB,
  updateOrderIntoDB,
};
