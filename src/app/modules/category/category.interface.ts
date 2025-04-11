import { Model, Types } from 'mongoose';

export type TCategory = {
  title: string;
  image: string;
  description?: string;
};

export interface ICategory extends Model<TCategory> {
  isCategoryExists(id: Types.ObjectId): Promise<TCategory | null>;
}
