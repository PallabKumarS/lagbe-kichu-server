import ListingModel from '../modules/listing/listing.model';
import OrderModel from '../modules/order/order.model';

import UserModel from '../modules/user/user.model';

// user id
export const generateUserId = async (userRole: string) => {
  const findLastUserId = async () => {
    const lastUser = await UserModel.findOne(
      { role: userRole },
      { userId: 1, _id: 0 },
    )
      .sort({ createdAt: -1 })
      .lean();
    return lastUser?.userId ? lastUser.userId : undefined;
  };

  let currentId = '0';
  const lastUserId = await findLastUserId();

  if (lastUserId) {
    currentId = lastUserId.split('-')[1];
  }

  let incrementId = '';

  if (userRole === 'admin') {
    incrementId = `A-${(Number(currentId) + 1).toString().padStart(5, '0')}`;
  } else if (userRole === 'seller') {
    incrementId = `S-${(Number(currentId) + 1).toString().padStart(5, '0')}`;
  } else if (userRole === 'buyer') {
    incrementId = `B-${(Number(currentId) + 1).toString().padStart(5, '0')}`;
  }

  return incrementId;
};

// listing id
export const generateListingId = async () => {
  const findLasListingId = async () => {
    const lastListing = await ListingModel.findOne({}, { listingId: 1, _id: 0 })
      .sort({ createdAt: -1 })
      .lean();
    return lastListing?.listingId ? lastListing.listingId : undefined;
  };

  let currentId = '0';
  const lastListingId = await findLasListingId();

  if (lastListingId) {
    currentId = lastListingId.split('-')[1];
  }

  let incrementId = `L-${(Number(currentId) + 1).toString().padStart(5, '0')}`;

  return incrementId;
};

// order id
export const generateOrderId = async () => {
  const findLasOrderId = async () => {
    const lastOrder = await OrderModel.findOne({}, { orderId: 1, _id: 0 })
      .sort({ createdAt: -1 })
      .lean();
    return lastOrder?.orderId ? lastOrder.orderId : undefined;
  };

  let currentId = '0';
  const lastOrderId = await findLasOrderId();

  if (lastOrderId) {
    currentId = lastOrderId.split('-')[1];
  }

  let incrementId = `O-${(Number(currentId) + 1).toString().padStart(5, '0')}`;

  return incrementId;
};
