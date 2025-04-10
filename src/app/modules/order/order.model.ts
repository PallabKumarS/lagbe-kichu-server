import { Schema, model, Document } from 'mongoose';
import { IOrder, TOrder } from './order.interface';

const orderSchema = new Schema<TOrder, IOrder>(
  {
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'],
      default: 'pending',
    },
    buyerId: { type: String, ref: 'User' },
    listingId: { type: String, ref: 'Listing' },
    sellerId: { type: String, ref: 'User' },
    orderId: { type: String, unique: true },
    sellerPhoneNumber: { type: String },
    transaction: {
      paymentId: { type: String },
      transactionStatus: { type: String },
      paymentUrl: { type: String },
      bankStatus: { type: String },
      spCode: { type: String },
      spMessage: { type: String },
      method: { type: String },
      dateTime: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.statics.isOrderExists = async function (id: string) {
  return await OrderModel.findOne({ id });
};

const OrderModel = model<TOrder, IOrder>('Order', orderSchema);

export default OrderModel;
