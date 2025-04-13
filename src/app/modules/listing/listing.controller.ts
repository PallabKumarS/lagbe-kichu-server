import { Request, Response } from 'express';
import { ListingService } from './listing.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

// get all listing controller
const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ListingService.getAllListingsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listings retrieved successfully',
    data,
    meta,
  });
});

// create listing controller
const createListing = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await ListingService.createListingIntoDB(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Listing created successfully',
    data: result,
  });
});

// get single listing controller
const getSingleListing = catchAsync(async (req: Request, res: Response) => {
  const listingId = req.params.listingId;
  const result = await ListingService.getSingleListingFromDB(listingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing retrieved successfully',
    data: result,
  });
});

// get personal listings controller (seller)
const getPersonalListings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const { data, meta } = await ListingService.getPersonalListingsFromDB(
    userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Personal listings retrieved successfully',
    data,
    meta,
  });
});

// update listing status controller
const updateListingStatus = catchAsync(async (req: Request, res: Response) => {
  const listingId = req.params.listingId;

  const result = await ListingService.updateListingStatusIntoDB(listingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing status updated successfully',
    data: result,
  });
});

// update listing controller
const updateListing = catchAsync(async (req: Request, res: Response) => {
  const listingId = req.params.listingId;
  const payload = req.body;

  const result = await ListingService.updateListingIntoDB(listingId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing updated successfully',
    data: result,
  });
});

// delete listing controller
const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const listingId = req.params.listingId;
  await ListingService.deleteListingFromDB(listingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing deleted successfully',
    data: null,
  });
});

// update listing discount
const updateListingDiscount = catchAsync(
  async (req: Request, res: Response) => {
    const listingId = req.params.listingId;
    const payload = req.body;

    const result = await ListingService.updateListingDiscountIntoDB(
      listingId,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Listing discount updated successfully',
      data: result,
    });
  },
);

export const ListingController = {
  getAllListings,
  getSingleListing,
  getPersonalListings,
  updateListingStatus,
  updateListing,
  deleteListing,
  createListing,
  updateListingDiscount,
};
