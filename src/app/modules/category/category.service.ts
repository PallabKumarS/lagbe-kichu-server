import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { TCategory } from './category.interface';
import CategoryModel from './category.model';

// gat all  category
const getAllCategoryFromDB = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(CategoryModel.find({}), query)
    .paginate()
    .filter()
    .sort();

  const data = await categoryQuery.modelQuery;
  const meta = categoryQuery.countTotal();

  return { data, meta };
};

// crate category
const createCategoryIntoDB = async (payload: TCategory) => {
  const result = await CategoryModel.create(payload);
  return result;
};

// update category
const updateCategoryIntoDB = async (
  id: Types.ObjectId,
  payload: Partial<TCategory>,
) => {
  const result = await CategoryModel.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

// delete category
const deleteCategoryFromDB = async (id: Types.ObjectId) => {
  const result = await CategoryModel.findByIdAndDelete(id);
  return result;
};

export const CategoryService = {
  getAllCategoryFromDB,
  createCategoryIntoDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};
