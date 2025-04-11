import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { Types } from 'mongoose';

// get all category
const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const data = await CategoryService.getAllCategoryFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data,
  });
});

// create category
const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategoryIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

// update category
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.updateCategoryIntoDB(
    new Types.ObjectId(id),
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

// delete category
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await CategoryService.deleteCategoryFromDB(new Types.ObjectId(id));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: null,
  });
});

export const CategoryController = {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
