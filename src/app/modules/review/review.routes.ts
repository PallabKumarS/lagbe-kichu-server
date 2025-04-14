import { Router } from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

// Define routes
router.get('/', auth(USER_ROLE.buyer), ReviewController.getAllReviews);

router.get('/:listingId', ReviewController.getAllListingReviews);

router.post('/', auth(USER_ROLE.buyer), ReviewController.createReview);

router.patch('/:id', auth(USER_ROLE.buyer), ReviewController.updateReview);

router.delete('/:id', auth(USER_ROLE.buyer), ReviewController.deleteReview);

export const ReviewRoutes = router;
