import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { Types } from 'mongoose';

// get all reviews
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const query = req.query;
  const { data, meta } = await ReviewService.getAllReviewsFromDB(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data,
    meta,
  });
});

// get all reviews of a listing
const getAllListingReviews = catchAsync(async (req: Request, res: Response) => {
  const { listingId } = req.params;

  const data = await ReviewService.getAllListingReviewsFromDB(
    listingId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data,
  });
});

// post a review
const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReviewIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

// update a review
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const userId = req.user?.userId;

  const result = await ReviewService.updateReviewIntoDB(
    new Types.ObjectId(id),
    payload,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

// delete a review
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  await ReviewService.deleteReviewFromDB(new Types.ObjectId(id), userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

export const ReviewController = {
  getAllReviews,
  getAllListingReviews,
  createReview,
  updateReview,
  deleteReview,
};
