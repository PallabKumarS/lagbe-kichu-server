import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatisticsService } from './statistics.service';

const getStatistics = catchAsync(async (req: Request, res: Response) => {
  const data = await StatisticsService.getStatisticsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Statistics retrieved successfully',
    data,
  });
});

const getDetailedStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const data = await StatisticsService.getDetailedStatisticsFromDB();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Detailed statistics retrieved successfully',
      data,
    });
  },
);

export const StatisticsController = {
  getStatistics,
  getDetailedStatistics,
};
