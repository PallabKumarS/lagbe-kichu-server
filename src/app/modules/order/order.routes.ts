import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';
import { OrderController } from './order.controller';

const router = Router();

router.get('/', auth(USER_ROLE.admin), OrderController.getAllOrder);

router.get(
  '/personal',
  auth(USER_ROLE.buyer, USER_ROLE.seller),
  OrderController.getPersonalOrder,
);

router.get(
  '/:orderId',
  auth(USER_ROLE.admin, USER_ROLE.buyer),
  OrderController.getSingleOrder,
);

router.post('/', auth(USER_ROLE.buyer), OrderController.createOrder);

router.patch(
  '/status/:orderId',
  auth(USER_ROLE.seller),
  OrderController.changeOrderStatus,
);

router.patch(
  '/:orderId',
  auth(USER_ROLE.seller, USER_ROLE.admin),
  OrderController.updateOrder,
);

router.patch(
  '/create-payment/:orderId',
  auth(USER_ROLE.buyer),
  OrderController.createPayment,
);

router.get(
  '/verify-payment/:paymentId',
  auth(USER_ROLE.buyer),
  OrderController.verifyPayment,
);

router.delete(
  '/:orderId',
  auth(USER_ROLE.admin, USER_ROLE.buyer),
  OrderController.deleteOrder,
);

export const OrderRoutes = router;
