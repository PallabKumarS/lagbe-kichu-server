import { Router } from 'express';
import { StatisticsController } from './statistics.controller';

const router = Router();

router.get('/', StatisticsController.getStatistics);

router.get('/detailed', StatisticsController.getDetailedStatistics);

export const StatisticsRoutes = router;
