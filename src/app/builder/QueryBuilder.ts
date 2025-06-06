import mongoose, { FilterQuery, Query, Types } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;

    if (searchTerm) {
      const orConditions: FilterQuery<T>[] = searchableFields
        .map((field) => {
          if (field === 'price') {
            const numericValue = Number(searchTerm);
            if (!isNaN(numericValue)) return { [field]: numericValue };
            return null;
          }

          // Handle ObjectId fields (like category)
          if (['category'].includes(field)) {
            if (mongoose.Types.ObjectId.isValid(searchTerm as string)) {
              return {
                [field]: new mongoose.Types.ObjectId(searchTerm as string),
              };
            }
            return null;
          }

          // Handle string fields (title, etc.)
          return {
            [field]: { $regex: new RegExp(searchTerm as string, 'i') },
          };
        })
        .filter((condition): condition is FilterQuery<T> => condition !== null);

      if (orConditions.length > 0) {
        this.modelQuery = this.modelQuery.find({ $or: orConditions });
      }
    }

    return this;
  }

  // filter here for filtering
  filter() {
    const queryObj = { ...this.query }; // copy

    // console.log(queryObj);

    // Filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    // if (typeof queryObj.category === 'string') {
    //   queryObj.category = {
    //     $in: queryObj.category
    //       .split(',')
    //       .map((category) => new RegExp(category.trim(), 'i')), // Partial match, no ^ or $
    //   };
    // }

    if (typeof queryObj.category === 'string') {
      queryObj.category = {
        $in: queryObj.category
          .split(',')
          .map((id) => new Types.ObjectId(id.trim())),
      };
    }

    if ('title' in queryObj) {
      queryObj.title = {
        $regex: queryObj.title,
        $options: 'i',
      };
    }

    if ('availability' in queryObj) {
      queryObj.isAvailable =
        queryObj.availability === 'true' || queryObj.availability === true;
      delete queryObj.availability;
    }

    if ('minPrice' in queryObj || 'maxPrice' in queryObj) {
      const priceFilter: { $gte?: number; $lte?: number } = {};
      if ('minPrice' in queryObj) {
        priceFilter.$gte = Number(queryObj.minPrice);
      }
      if ('maxPrice' in queryObj) {
        priceFilter.$lte = Number(queryObj.maxPrice);
      }

      (queryObj as any).price = priceFilter; // change the rentPrice as needed as that is the field name in the database

      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  // sorting here
  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';

    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 8;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.replace(/,/g, ' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const totalDoc = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(totalDoc / limit);

    return {
      page,
      limit,
      totalDoc,
      totalPage,
    };
  }
}

export default QueryBuilder;
