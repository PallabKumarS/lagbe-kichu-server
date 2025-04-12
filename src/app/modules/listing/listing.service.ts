import dayjs from 'dayjs';
import QueryBuilder from '../../builder/QueryBuilder';
import { AppError } from '../../errors/AppError';
import { generateListingId } from '../../utils/generateID';
import OrderModel from '../order/order.model';
import { listingSearchableFields } from './listing.constant';
import { TListing } from './listing.interface';
import ListingModel from './listing.model';
import httpStatus from 'http-status';

// get all listings from db
const getAllListingsFromDB = async (query: Record<string, unknown>) => {
  const listingQuery = new QueryBuilder(ListingModel.find({}), query)
    .search(listingSearchableFields)
    .filter()
    .sort()
    .paginate();

  const data = await listingQuery.modelQuery
    .populate({
      path: 'sellerId',
      localField: 'sellerId',
      foreignField: 'userId',
    })
    .populate('category');
  const meta = await listingQuery.countTotal();

  return { data, meta };
};

// create listings in the db
const createListingIntoDB = async (payload: TListing) => {
  payload.listingId = await generateListingId();

  const result = await ListingModel.create(payload);
  return result;
};

// get single listing from db
const getSingleListingFromDB = async (listingId: string) => {
  const isExists = await ListingModel.isListingExists(listingId);

  if (!isExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Listing not found');
  }

  const result = await ListingModel.findOne({
    listingId,
    isDeleted: false,
  }).populate({
    path: 'sellerId',
    localField: 'sellerId',
    foreignField: 'userId',
  }).populate('category');
  return result;
};

// get personal listings from db (seller)
const getPersonalListingsFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const listingQuery = new QueryBuilder(
    ListingModel.find({
      sellerId: userId,
      isDeleted: false,
    })
      .populate({
        path: 'sellerId',
        localField: 'sellerId',
        foreignField: 'userId',
      })
      .populate('category'),
    query,
  )
    .filter()
    .sort()
    .paginate();

  const data = await listingQuery.modelQuery;
  const meta = await listingQuery.countTotal();

  return { data, meta };
};

// update status of listing in the db
const updateListingStatusIntoDB = async (listingId: string) => {
  const isListing = await ListingModel.isListingExists(listingId);
  if (!isListing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Listing not found');
  }

  const order = await OrderModel.findOne({ listingId: listingId });

  if (order?.status === 'paid' && !isListing.isAvailable) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Listing is already rented');
  }

  const result = await ListingModel.findOneAndUpdate(
    { listingId },
    { isAvailable: !isListing.isAvailable },
    {
      new: true,
    },
  );
  return result;
};

// update listing in the db
const updateListingIntoDB = async (
  listingId: string,
  payload: Partial<TListing>,
) => {
  const isListing = await ListingModel.isListingExists(listingId);
  if (!isListing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Listing not found');
  }
  const result = await ListingModel.findOneAndUpdate({ listingId }, payload, {
    new: true,
  });
  return result;
};

// delete listing from the db
const deleteListingFromDB = async (listingId: string) => {
  const isListing = await ListingModel.isListingExists(listingId);
  if (!isListing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Listing not found');
  }
  const result = await ListingModel.findOneAndDelete({ listingId });
  return result;
};

// get listing locations from db
const getListingLocationsFromDB = async () => {
  const result = await ListingModel.aggregate([
    // first pipeline
    {
      $group: {
        _id: '$houseLocation',
      },
    },

    // second pipeline
    {
      $project: {
        location: '$_id',
        _id: 0,
      },
    },
  ]);

  return result;
};

// update discount in the db
const updateListingDiscountIntoDB = async (
  listingId: string,
  payload: Partial<TListing>,
) => {
  const isListing = await ListingModel.isListingExists(listingId);
  if (!isListing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Listing not found');
  }

  if (payload.discount && payload.discount > 100) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Discount cannot be greater than 100%',
    );
  }

  if (payload.discount && payload.discount < 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Discount cannot be negative');
  }

  if (
    payload.discountStartDate &&
    payload.discountEndDate &&
    dayjs(payload.discountStartDate).isAfter(dayjs(payload.discountEndDate))
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Discount end date cannot be before start date',
    );
  }

  const result = await ListingModel.findOneAndUpdate({ listingId }, payload, {
    new: true,
  });
  return result;
};

export const ListingService = {
  getAllListingsFromDB,
  createListingIntoDB,
  getSingleListingFromDB,
  getPersonalListingsFromDB,
  updateListingStatusIntoDB,
  updateListingIntoDB,
  deleteListingFromDB,
  getListingLocationsFromDB,
  updateListingDiscountIntoDB,
};
