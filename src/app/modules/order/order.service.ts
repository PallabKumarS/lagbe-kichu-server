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

interface PopulatedListing {
  rentPrice: number;
  houseLocation: string;
}

interface PopulatedTenant {
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface PopulatedLandlord {
  userId: string;
}

type PopulatedOrder = {
  listingId: PopulatedListing;
  tenantId: PopulatedTenant;
  landlordId: PopulatedLandlord;
  orderId: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  message?: string;
  moveInDate: Date;
  rentDuration: string;
  transaction?: Record<string, any>;
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
        path: 'tenantId',
        localField: 'tenantId',
        foreignField: 'userId',
      })
      .populate({
        path: 'landlordId',
        localField: 'landlordId',
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.orderId = await generateOrderId();

    const isOrderExists = await OrderModel.findOne({
      listingId: payload.listingId,
      tenantId: payload.tenantId,
    });

    if (isOrderExists) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already applied for this listing',
      );
    }

    const result = await OrderModel.create([payload], { session });

    if (result?.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create order');
    }

    const user = await UserModel.findOne({ userId: payload.landlordId });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const listing = await ListingModel.findOne({
      listingId: payload.listingId,
    });
    if (!listing) {
      throw new AppError(httpStatus.NOT_FOUND, 'Listing not found');
    }

    const info = await sendOrderStatusChangeEmail(
      user?.email,
      payload?.orderId as string,
      payload?.status,
      payload?.listingId,
      listing?.title,
    );
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

// get personal orders from db (buyer & seller)
const getPersonalOrderFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const orderQuery = new QueryBuilder(
    OrderModel.find({
      $or: [{ tenantId: userId }, { landlordId: userId }],
    })
      .populate({
        path: 'listingId',
        localField: 'listingId',
        foreignField: 'listingId',
      })
      .populate({
        path: 'tenantId',
        localField: 'tenantId',
        foreignField: 'userId',
      })
      .populate({
        path: 'landlordId',
        localField: 'landlordId',
        foreignField: 'userId',
      }),
    query,
  );

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
      path: 'tenantId',
      localField: 'tenantId',
      foreignField: 'userId',
    })
    .populate({
      path: 'landlordId',
      localField: 'landlordId',
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

    if (isOrderExists.status === 'paid') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Order already paid');
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

    const user = await UserModel.findOne({ userId: result?.tenantId });
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
      result?.listingId,
      listing?.title,
    );
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

  if (isOrderExists.status === 'paid') {
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
        path: 'tenantId',
        localField: 'tenantId',
        foreignField: 'userId',
      })
      .populate({
        path: 'landlordId',
        localField: 'landlordId',
        foreignField: 'userId',
      })
      .lean()
      .exec()) as unknown as PopulatedOrder;

    const shurjopayPayload = {
      amount: orderData?.listingId.rentPrice,
      order_id: orderId,
      currency: 'BDT',
      customer_name: orderData?.tenantId.name,
      customer_address: orderData?.tenantId?.address || 'N/A',
      customer_email: orderData?.tenantId.email,
      customer_phone: orderData?.tenantId?.phone || 'N/A',
      customer_city: orderData?.listingId.houseLocation || 'N/A',
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
            ? 'paid'
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

  // if the payment is successful, update the bike quantity
  if (payment[0].bank_status === 'Success') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // check if order was placed before
      const orderExists = await OrderModel.findOne({
        'transaction.paymentId': paymentId,
      });

      if (!orderExists) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Payment was not done correctly, please try again',
        );
      }

      // update  (first transaction)
      const updatedOrder = await OrderModel.findOneAndUpdate(
        { orderId: orderExists?.orderId },
        { status: 'paid' },
        { new: true, session },
      );

      if (!updatedOrder) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update order');
      }

      // update order (second transaction)
      const updatedListing = await ListingModel.findOneAndUpdate(
        { listingId: orderExists?.listingId },
        {
          isAvailable: false,
        },
      );

      if (!updatedListing) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update listing');
      }

      const user = await UserModel.findOne({
        userId: updatedOrder?.tenantId,
      });
      if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
      }

      const info = await sendPaymentConfirmationEmail(
        user?.email,
        updatedOrder?.orderId as string,
        updatedOrder?.transaction?.paymentId as string,
        updatedListing?.listingId as string,
        updatedListing?.price,
      );

      if (info.accepted.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email not sent');
      }

      await session.commitTransaction();
      await session.endSession();
    } catch (err: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error(err);
    }
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment failed');
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
