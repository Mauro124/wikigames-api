import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { submitResultUseCase } from '../domain/submit-result.usecase';
import { AuthRequest } from '@middleware/verify-auth.middleware';

export class ResultController {
  validateSubmission = [
    body('challengeId').isString().notEmpty(),
    body('clicks').isInt({ min: 1 }),
    body('timeSeconds').isInt({ min: 1 }),
    body('path').isArray({ min: 1 }),
  ];

  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
      // Use the authenticated user's ID
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      await submitResultUseCase.execute({
        ...req.body,
        userId,
      });
      res.status(201).json({ status: 'success', message: 'Result processed' });
    } catch (error) {
      next(error);
    }
  }
}

export const resultController = new ResultController();
