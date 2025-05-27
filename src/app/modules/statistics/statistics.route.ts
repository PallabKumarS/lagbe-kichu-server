import { Router } from 'express';
import { StatisticsController } from './statistics.controller';

const router = Router();

router.get('/', StatisticsController.getStatistics);

export const StatisticsRoutes = router;
