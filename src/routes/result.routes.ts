import { Router } from 'express';
import { resultController } from '@features/results/controllers/result.controller';
import { verifyAuth } from '@middleware/verify-auth.middleware';

const resultRouter = Router();

// Only authenticated users can submit results
resultRouter.post('/', verifyAuth as any, resultController.validateSubmission, resultController.submit);

export { resultRouter };
