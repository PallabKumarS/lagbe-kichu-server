import { Router } from 'express';
import { ListingController } from './listing.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.get('/', ListingController.getAllListings);

router.get('/locations', ListingController.getListingLocations);

router.get('/:listingId', ListingController.getSingleListing);

router.get(
  '/personal',
  auth({ role: USER_ROLE.seller, subRoles: ['manager', 'accountant'] }),
  ListingController.getPersonalListings,
);

router.post(
  '/',
  auth({ role: USER_ROLE.seller, subRoles: ['manager', 'inventory_staff'] }),
  ListingController.createListing,
);

router.patch(
  '/:listingId',
  auth(
    { role: USER_ROLE.seller, subRoles: ['manager', 'inventory_staff'] },
    USER_ROLE.admin,
  ),
  ListingController.updateListing,
);

router.patch(
  '/status/:listingId',
  auth(
    { role: USER_ROLE.seller, subRoles: ['manager', 'inventory_staff'] },
    USER_ROLE.admin,
  ),
  ListingController.updateListingStatus,
);

router.patch(
  '/discount/:listingId',
  auth(
    { role: USER_ROLE.seller, subRoles: ['manager', 'inventory_staff'] },
    USER_ROLE.admin,
  ),
  ListingController.updateListingDiscount,
);

router.delete(
  '/:listingId',
  auth({ role: USER_ROLE.seller, subRoles: ['manager'] }, USER_ROLE.admin),
  ListingController.deleteListing,
);

export const ListingRoutes = router;
