import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ListingModel from '../modules/listing/listing.model';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Asia/Dhaka';

export const startDiscountCronJob = () => {
  cron.schedule('* * * * *', async () => {
    const now = dayjs().tz(TIMEZONE).toDate();

    try {
      await ListingModel.updateMany(
        {
          discountStartDate: { $lte: now },
          isDiscountActive: false,
        },
        { $set: { isDiscountActive: true } },
      );

      await ListingModel.updateMany(
        {
          discountEndDate: { $lte: now },
          isDiscountActive: true,
        },
        {
          $set: {
            discount: 0,
            isDiscountActive: false,
          },
        },
      );
    } catch (err) {
      console.error('Discount cron error:', err);
    }
  });
};
