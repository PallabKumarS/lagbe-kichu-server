import { z } from 'zod';

const createRequestValidation = z.object({
  body: z.object({
    buyerId: z.string({
      required_error: 'Buyer is required',
    }),
    listingId: z.array(
      z.string({
        required_error: 'ListingId is required',
      }),
    ),
    price: z.number({
      required_error: 'Price is required',
    }),
  }),
});

const updateRequestValidation = createRequestValidation.partial();

export const RequestValidation = {
  createRequestValidation,
  updateRequestValidation,
};
