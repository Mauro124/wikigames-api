import { Router } from 'express';
import { resultController } from '@features/results/controllers/result.controller';

const resultRouter = Router();

// Anonymous submissions are allowed for MVP, using client-provided userId
resultRouter.post(
  '/',
  resultController.validateSubmission,
  resultController.submit.bind(resultController),
);

export { resultRouter };
