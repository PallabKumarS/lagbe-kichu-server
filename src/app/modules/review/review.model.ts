import { Schema, model, Document } from 'mongoose';
import { TReview, IReview } from './review.interface';

const reviewSchema = new Schema<TReview, IReview>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      ref: 'Order',
      required: true,
    },
    listingId: {
      type: String,
      ref: 'Listing',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.statics.isReviewExists = async function (
  id: Schema.Types.ObjectId,
) {
  return await ReviewModel.findOne({ _id: id });
};

const ReviewModel = model<TReview, IReview>('Reviews', reviewSchema);

export default ReviewModel;
