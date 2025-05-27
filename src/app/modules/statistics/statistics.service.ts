import ListingModel from '../listing/listing.model';
import UserModel from '../user/user.model';

const getStatisticsFromDB = async () => {
  // Get user counts by role
  const totalAdmins = await UserModel.countDocuments({ role: 'admin' });
  const totalSellers = await UserModel.countDocuments({ role: 'seller' });
  const totalBuyers = await UserModel.countDocuments({ role: 'buyer' });

  // Get active vs inactive users by role
  const activeAdmins = await UserModel.countDocuments({
    role: 'admin',
    status: 'active',
  });
  const activeSellers = await UserModel.countDocuments({
    role: 'seller',
    status: 'active',
  });
  const activeBuyers = await UserModel.countDocuments({
    role: 'buyer',
    status: 'active',
  });

  // Total counts
  const totalUsers = await UserModel.countDocuments();
  const totalActiveUsers = await UserModel.countDocuments({ isActive: true });
  const totalProducts = await ListingModel.countDocuments({ isDeleted: false });
  const totalAvailableProducts = await ListingModel.countDocuments({
    isDeleted: false,
    isAvailable: true,
  });

  return {
    totalUsers,
    totalActiveUsers,
    totalProducts,
    totalAvailableProducts,
    userBreakdown: {
      admins: {
        total: totalAdmins,
        active: activeAdmins,
      },
      sellers: {
        total: totalSellers,
        active: activeSellers,
      },
      buyers: {
        total: totalBuyers,
        active: activeBuyers,
      },
    },
  };
};

export const StatisticsService = {
  getStatisticsFromDB,
};
