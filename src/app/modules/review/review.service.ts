import { Types } from 'mongoose';
import { TReview } from './review.interface';
import ReviewModel from './review.model';
import { TUser } from '../user/user.interface';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import OrderModel from '../order/order.model';

// get all reviews of a listing
const getAllReviewFromDB = async (listingId: string) => {
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
  getAllReviewFromDB,
  createReviewIntoDB,
  updateReviewIntoDB,
  deleteReviewFromDB,
};
