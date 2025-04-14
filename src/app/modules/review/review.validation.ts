import { z } from 'zod';

const createReviewValidation = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'UserId is required',
    }),
    listingId: z.string({
      required_error: 'ListingId is required',
    }),
    rating: z.string({
      required_error: 'rating is required',
    }),
  }),
});

const updateReviewValidation = createReviewValidation.partial();

export const ReviewValidation = {
  createReviewValidation,
  updateReviewValidation,
};
