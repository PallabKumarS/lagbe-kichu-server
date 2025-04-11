import { Router } from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

// Define routes
router.get('/', CategoryController.getAllCategory);

router.post('/', auth(USER_ROLE.admin), CategoryController.createCategory);

router.patch('/:id', auth(USER_ROLE.admin), CategoryController.updateCategory);

router.delete('/:id', auth(USER_ROLE.admin), CategoryController.deleteCategory);

export const CategoryRoutes = router;
