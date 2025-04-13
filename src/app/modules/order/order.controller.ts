import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';
import httpStatus from 'http-status';

// get all orders controller (admin)
const getAllOrder = catchAsync(async (req: Request, res: Response) => {
  const data = await OrderService.getAllOrderFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data,
  });
});

// create order controller (buyer)
const createOrder = catchAsync(async (req: Request, res: Response) => {
  const data = await OrderService.createOrderIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order created successfully',
    data,
  });
});

// get personal orders controller (buyer & seller)
const getPersonalOrder = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await OrderService.getPersonalOrderFromDB(
    req.user?.userId,
    req.query,
    req.user?.role,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data,
    meta,
  });
});

// get single order controller (admin)
const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const data = await OrderService.getSingleOrderFromDB(req.params.orderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data,
  });
});

// change status of order controller (seller)
const changeOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await OrderService.changeOrderStatusIntoDB(
    req.params.orderId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status changed successfully',
    data,
  });
});

// update order controller
const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const data = await OrderService.updateOrderIntoDB(
    req.params.orderId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order updated successfully',
    data,
  });
});

// delete orders controller (admin)
const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const data = await OrderService.deleteOrderFromDB(req.params.orderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order deleted successfully',
    data,
  });
});

// payment controller (buyer)
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId;

  const data = await OrderService.createPaymentIntoDB(orderId, req.ip!);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment process started',
    data,
  });
});

// verify payment and update order status controller (buyer)
const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const paymentId = req.params.paymentId;

  const result = await OrderService.verifyPaymentFromDB(paymentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment verified successfully',
    data: result,
  });
});

export const OrderController = {
  getAllOrder,
  createOrder,
  getPersonalOrder,
  getSingleOrder,
  deleteOrder,
  changeOrderStatus,
  createPayment,
  verifyPayment,
  updateOrder,
};
