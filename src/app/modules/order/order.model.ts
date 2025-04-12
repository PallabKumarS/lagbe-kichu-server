import { Schema, model, Document } from 'mongoose';
import { IOrder, TOrder } from './order.interface';

const orderSchema = new Schema<TOrder, IOrder>(
  {
    price: { type: Number, required: true },
    paymentType: { type: String, enum: ['payment', 'cash'], required: true },
    buyerId: { type: String, ref: 'User',required: true },
    orderId: { type: String, unique: true },
    message: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'rejected',
        'out for delivery',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    listingId: [{ type: String, ref: 'Listing' }],
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
