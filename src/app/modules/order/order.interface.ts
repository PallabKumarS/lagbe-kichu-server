import { Model } from 'mongoose';

export type TOrder = {
  tenantId: string;
  listingId: string;
  landlordId: string;
  orderId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  message?: string;
  moveInDate: Date;
  rentDuration: string;
  landlordPhoneNumber?: string;
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
