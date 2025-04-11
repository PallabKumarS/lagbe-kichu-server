import { Model } from 'mongoose';

export type TOrder = {
  buyerId: string;
  listingId: string;
  sellerId: string;
  orderId?: string;
  status:
    | 'pending'
    | 'processing'
    | 'out for delivery'
    | 'paid'
    | 'completed'
    | 'cancelled';
  message?: string;
  sellerPhoneNumber?: string;
  transaction?: {
    paymentId?: string;
    transactionStatus?: string;
    paymentUrl?: string;
    bankStatus?: string;
    spCode?: string;
    spMessage?: string;
    method?: string;
    dateTime?: string;
  };
};

export interface IOrder extends Model<TOrder> {
  isOrderExists(id: string): Promise<TOrder | null>;
}
