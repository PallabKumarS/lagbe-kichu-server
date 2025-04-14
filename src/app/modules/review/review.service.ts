import { Types } from 'mongoose';
import { TReview } from './review.interface';
import ReviewModel from './review.model';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import OrderModel from '../order/order.model';
import QueryBuilder from '../../builder/QueryBuilder';

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
      })
      .populate({
        path: 'orderId',
        localField: 'orderId',
        foreignField: 'orderId',
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
  const result = await ReviewModel.find({ listingId })
    .populate({
      path: 'userId',
      localField: 'userId',
      foreignField: 'userId',
    })
    .populate({
      path: 'listingId',
      localField: 'listingId',
      foreignField: 'listingId',
    })
    .populate({
      path: 'orderId',
      localField: 'orderId',
      foreignField: 'orderId',
    });
  return result;
};

// post a review
const createReviewIntoDB = async (payload: Partial<TReview>) => {
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

  const result = await ReviewModel.create(payload);
  return result;
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
