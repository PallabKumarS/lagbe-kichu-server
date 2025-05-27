import ListingModel from '../listing/listing.model';
import UserModel from '../user/user.model';
import OrderModel from '../order/order.model';

const getStatisticsFromDB = async () => {
  // Current date calculations
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentYear = new Date(now.getFullYear(), 0, 1);
  const lastYear = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

  // Total counts
  const totalUsers = await UserModel.countDocuments({ isDeleted: false });
  const totalListings = await ListingModel.countDocuments({ isDeleted: false });
  const totalOrders = await OrderModel.countDocuments();

  // Calculate total revenue from completed orders
  const revenueResult = await OrderModel.aggregate([
    {
      $match: {
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$price' },
      },
    },
  ]);
  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  // Monthly growth calculations
  const currentMonthUsers = await UserModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: currentMonth },
  });
  const lastMonthUsers = await UserModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: lastMonth, $lt: currentMonth },
  });

  const currentMonthListings = await ListingModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: currentMonth },
  });
  const lastMonthListings = await ListingModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: lastMonth, $lt: currentMonth },
  });

  const currentMonthOrders = await OrderModel.countDocuments({
    createdAt: { $gte: currentMonth },
  });
  const lastMonthOrders = await OrderModel.countDocuments({
    createdAt: { $gte: lastMonth, $lt: currentMonth },
  });

  // Current month revenue
  const currentMonthRevenueResult = await OrderModel.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: currentMonth },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$price' },
      },
    },
  ]);
  const currentMonthRevenue =
    currentMonthRevenueResult.length > 0
      ? currentMonthRevenueResult[0].revenue
      : 0;

  // Last month revenue
  const lastMonthRevenueResult = await OrderModel.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: lastMonth, $lt: currentMonth },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$price' },
      },
    },
  ]);
  const lastMonthRevenue =
    lastMonthRevenueResult.length > 0 ? lastMonthRevenueResult[0].revenue : 0;

  // Yearly growth calculations
  const currentYearUsers = await UserModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: currentYear },
  });
  const lastYearUsers = await UserModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: lastYear, $lte: lastYearEnd },
  });

  const currentYearListings = await ListingModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: currentYear },
  });
  const lastYearListings = await ListingModel.countDocuments({
    isDeleted: false,
    createdAt: { $gte: lastYear, $lte: lastYearEnd },
  });

  const currentYearOrders = await OrderModel.countDocuments({
    createdAt: { $gte: currentYear },
  });
  const lastYearOrders = await OrderModel.countDocuments({
    createdAt: { $gte: lastYear, $lte: lastYearEnd },
  });

  // Current year revenue
  const currentYearRevenueResult = await OrderModel.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: currentYear },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$price' },
      },
    },
  ]);
  const currentYearRevenue =
    currentYearRevenueResult.length > 0
      ? currentYearRevenueResult[0].revenue
      : 0;

  // Last year revenue
  const lastYearRevenueResult = await OrderModel.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: lastYear, $lte: lastYearEnd },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$price' },
      },
    },
  ]);
  const lastYearRevenue =
    lastYearRevenueResult.length > 0 ? lastYearRevenueResult[0].revenue : 0;

  // Calculate growth percentages
  const calculateGrowthPercentage = (
    current: number,
    previous: number,
  ): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Monthly growth percentages
  const monthlyGrowth = {
    users: calculateGrowthPercentage(currentMonthUsers, lastMonthUsers),
    listings: calculateGrowthPercentage(
      currentMonthListings,
      lastMonthListings,
    ),
    orders: calculateGrowthPercentage(currentMonthOrders, lastMonthOrders),
    revenue: calculateGrowthPercentage(currentMonthRevenue, lastMonthRevenue),
  };

  // Yearly growth percentages
  const yearlyGrowth = {
    users: calculateGrowthPercentage(currentYearUsers, lastYearUsers),
    listings: calculateGrowthPercentage(currentYearListings, lastYearListings),
    orders: calculateGrowthPercentage(currentYearOrders, lastYearOrders),
    revenue: calculateGrowthPercentage(currentYearRevenue, lastYearRevenue),
  };

  return {
    totalUsers,
    totalListings,
    totalOrders,
    totalRevenue,
    monthlyGrowth,
    yearlyGrowth,
  };
};

// Keep the existing detailed statistics function
const getDetailedStatisticsFromDB = async () => {
  // Get user counts by role
  const totalAdmins = await UserModel.countDocuments({ role: 'admin' });
  const totalSellers = await UserModel.countDocuments({ role: 'seller' });
  const totalBuyers = await UserModel.countDocuments({ role: 'buyer' });

  // Get active vs inactive users by role
  const activeAdmins = await UserModel.countDocuments({
    role: 'admin',
    isActive: true,
  });
  const activeSellers = await UserModel.countDocuments({
    role: 'seller',
    isActive: { $ne: true },
  });
  const activeBuyers = await UserModel.countDocuments({
    role: 'buyer',
    isActive: { $ne: true },
  });

  // Total counts
  const totalUsers = await UserModel.countDocuments();
  const totalActiveUsers = await UserModel.countDocuments({
    isActive: { $ne: { $ne: true } },
  });
  const totalProducts = await ListingModel.countDocuments({ isDeleted: false });
  const totalAvailableProducts = await ListingModel.countDocuments({
    isDeleted: false,
    isAvailable: { $ne: true },
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
  getDetailedStatisticsFromDB,
};
