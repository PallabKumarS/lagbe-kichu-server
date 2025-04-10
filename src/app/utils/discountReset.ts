import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ListingModel from '../modules/listing/listing.model';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Asia/Dhaka';

cron.schedule('* * * * *', async () => {
  const now = dayjs().tz(TIMEZONE).toDate();

  try {
    // 1. Activate discount if current time >= discountStartTime
    await ListingModel.updateMany(
      {
        discountStartTime: { $lte: now },
        isDiscountActive: false,
      },
      {
        $set: { isDiscountActive: true },
      },
    );

    // 2. Deactivate discount if current time >= discountEndTime
    await ListingModel.updateMany(
      {
        discountEndTime: { $lte: now },
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
