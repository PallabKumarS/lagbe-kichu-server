import validateRequest from '../../middlewares/validateRequest';
import { Router } from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constants';

const router = Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser,
);

router.get('/', auth(USER_ROLE.admin), UserController.getAllUsers);

router.get(
  '/me',
  auth(USER_ROLE.buyer, USER_ROLE.admin, USER_ROLE.seller),
  UserController.getMe,
);

router.patch(
  '/status/:userId',
  auth(USER_ROLE.admin),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUserStatus,
);

router.patch(
  '/role/:userId',
  auth(USER_ROLE.admin),
  UserController.updateUserRole,
);

router.patch(
  '/:userId',
  auth(USER_ROLE.admin, USER_ROLE.buyer, USER_ROLE.seller),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUser,
);

router.delete('/:userId', auth(USER_ROLE.admin), UserController.deleteUser);

export const UserRoutes = router;
