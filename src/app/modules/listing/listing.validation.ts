import { z } from 'zod';

const createListingsValidation = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
    price: z.number({
      required_error: 'Price is required',
    }),
    category: z.string({
      required_error: 'Category is required',
    }),
    images: z
      .array(z.string({ required_error: 'At least one image is required' }))
      .min(1),
  }),
});

const updateListingsValidation = createListingsValidation.partial();

export const ListingsValidation = {
  createListingsValidation,
  updateListingsValidation,
};
