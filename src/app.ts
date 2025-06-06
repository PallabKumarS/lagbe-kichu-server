import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import config from './app/config';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import { UserRoutes } from './app/modules/user/user.routes';
import { AuthRoutes } from './app/modules/auth/auth.routes';
import { ListingRoutes } from './app/modules/listing/listing.routes';
import { OrderRoutes } from './app/modules/order/order.routes';
import { ReviewRoutes } from './app/modules/review/review.routes';
import { CategoryRoutes } from './app/modules/category/category.routes';
import { StatisticsRoutes } from './app/modules/statistics/statistics.route';

const app: Application = express();

// parsers
app.use(
  cors({
    origin: [
      config.local_client as string,
      config.client as string,
      'http://localhost:3000',
      'https://pks-lagbe-kichu-client.vercel.app',
    ].filter(Boolean),
    credentials: true,
  }),
);

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`);
//   console.log('Query params:', req.query);
//   console.log('Body:', req.body);
//   console.log('Headers:', req.headers);
//   console.log('---');
//   next();
// });

app.use(cookieParser());
app.use(express.json());

// all routes here
app.use('/api/users', UserRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/listings', ListingRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/reviews', ReviewRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api/statistics', StatisticsRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Server Status</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f4f4f4;
          font-family: Arial, sans-serif;
        }
        h1 {
          text-align: center;
          color: #333;
        }
      </style>
    </head>
    <body>
      <h1>🚀 Server is running successfully! 🚀</h1>
    </body>
    </html>
  `);
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
