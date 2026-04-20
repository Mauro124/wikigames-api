import { Router } from 'express';
import { internalChallengeController } from '@features/challenges/controllers/internal-challenge.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const internalRouter = Router();

// Protect all internal routes
internalRouter.use(authMiddleware);

internalRouter.post(
  '/challenges/generate',
  internalChallengeController.generateMonthlyBatch.bind(internalChallengeController),
);

export { internalRouter };
