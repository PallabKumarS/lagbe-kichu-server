import { Schema, model } from 'mongoose';
import { IListing, TListing } from './listing.interface';

const listingSchema = new Schema<TListing, IListing>(
  {
    title: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], required: true },
    sellerId: { type: String, ref: 'User',required: true },
    videoLink: { type: String, required: true },
    reviewRating: {
      rating: { type: Number, default: 0 },
      totalCount: { type: Number, default: 0 },
    },
    discount: { type: Number, default: 0 },
    discountStartDate: { type: Date },
    discountEndDate: { type: Date },
    isDiscountActive: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    listingId: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

listingSchema.statics.isListingExists = async function (listingId: string) {
  return await ListingModel.findOne({ listingId });
};

const ListingModel = model<TListing, IListing>('Listing', listingSchema);

export default ListingModel;
