import mongoose, { Types } from 'mongoose';
import { TReview } from './review.interface';
import ReviewModel from './review.model';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import OrderModel from '../order/order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { TListing } from '../listing/listing.interface';
import ListingModel from '../listing/listing.model';

// get all reviews
const getAllReviewsFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const reviewQuery = new QueryBuilder(
    ReviewModel.find({ userId })
      .populate({
        path: 'userId',
        localField: 'userId',
        foreignField: 'userId',
      })
      .populate({
        path: 'listingId',
        localField: 'listingId',
        foreignField: 'listingId',
      }),
    query,
  )
    .paginate()
    .filter()
    .sort();

  const data = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();

  return {
    meta,
    data,
  };
};

// get all reviews of a listing
const getAllListingReviewsFromDB = async (listingId: string) => {
  const result = await ReviewModel.find({ listingId: listingId })
    .populate({
      path: 'userId',
      localField: 'userId',
      foreignField: 'userId',
    })
    .populate({
      path: 'listingId',
      localField: 'listingId',
      foreignField: 'listingId',
    });
  return result;
};

// post a review
const createReviewIntoDB = async (payload: Partial<TReview>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const listingExists = await ListingModel.findOne({
      listingId: payload.listingId,
    });

    if (!listingExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'This listing does not exist');
    }

    const isReviewExists = await ReviewModel.findOne({
      userId: payload.userId,
      listingId: payload.listingId,
    });

    if (isReviewExists) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already reviewed this product, please update your review',
      );
    }

    const isUserOrdered = await OrderModel.findOne({
      buyerId: payload.userId,
      listingId: payload.listingId,
    });

    if (!isUserOrdered) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'You are not allowed to review a product that you did not order',
      );
    }

    const result = await ReviewModel.create([payload], { session });

    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create review');
    }

    const newRating =
      (listingExists.rating!.rating! + payload.rating!) /
        listingExists.rating!.totalRating! +
      1;

    const updatedListing = await ListingModel.findOneAndUpdate(
      { listingId: listingExists.listingId },
      {
        rating: {
          rating: newRating,
          totalRating: listingExists.rating!.totalRating! + 1,
        },
      },
      { new: true, session },
    );

    if (!updatedListing) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to update listing rating',
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

// update a review
const updateReviewIntoDB = async (
  id: Types.ObjectId,
  payload: Partial<TReview>,
  userId: string,
) => {
  const isReviewExists = await ReviewModel.isReviewExists(id);

  if (!isReviewExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (isReviewExists.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
  }

  const result = await ReviewModel.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

// delete a review
const deleteReviewFromDB = async (id: Types.ObjectId, userId: string) => {
  const isReviewExists = await ReviewModel.isReviewExists(id);

  if (!isReviewExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (isReviewExists.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
  }

  const result = await ReviewModel.findOneAndDelete({ _id: id });
  return result;
};

export const ReviewService = {
  getAllReviewsFromDB,
  getAllListingReviewsFromDB,
  createReviewIntoDB,
  updateReviewIntoDB,
  deleteReviewFromDB,
};
