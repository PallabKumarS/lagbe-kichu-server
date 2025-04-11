import { Model, Types } from 'mongoose';

export type TReview = {
  userId: string;
  listingId: string;
  orderId: string;
  rating: number;
  comment?: string;
};

export interface IReview extends Model<TReview> {
  isReviewExists(id: Types.ObjectId): Promise<TReview | null>;
}
