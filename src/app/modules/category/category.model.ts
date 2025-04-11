import { Schema, model } from 'mongoose';
import { TCategory, ICategory } from './category.interface';

const categorySchema = new Schema<TCategory, ICategory>(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String },
  },
  {
    timestamps: true,
  },
);

categorySchema.statics.isCategoryExists = async function (
  id: Schema.Types.ObjectId,
) {
  return await CategoryModel.findOne({ id });
};

const CategoryModel = model<TCategory, ICategory>('Category', categorySchema);

export default CategoryModel;
