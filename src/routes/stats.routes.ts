import { Router } from 'express';
import { statsController } from '@features/stats/controllers/stats.controller';
import { challengeController } from '@features/challenges/controllers/challenge.controller';

const statsRouter = Router();

statsRouter.get('/today', challengeController.getToday);
statsRouter.get('/', challengeController.list);
statsRouter.get('/:id/stats', statsController.getStats);

export { statsRouter };
