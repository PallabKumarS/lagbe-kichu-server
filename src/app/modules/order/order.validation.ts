import { z } from 'zod';

const createRequestValidation = z.object({
  body: z.object({
    buyerId: z.string({
      required_error: 'Buyer is required',
    }),
    listingId: z.string({
      required_error: 'Listing is required',
    }),
    sellerId: z.string({
      required_error: 'Seller is required',
    }),
  }),
});

const updateRequestValidation = createRequestValidation.partial();

export const RequestValidation = {
  createRequestValidation,
  updateRequestValidation,
};
