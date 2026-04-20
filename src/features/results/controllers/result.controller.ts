import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { submitResultUseCase } from '../domain/submit-result.usecase';

export class ResultController {
  validateSubmission = [
    body('challengeId').isString().notEmpty(),
    body('userId').isString().notEmpty(),
    body('clicks').isInt({ min: 1 }),
    body('timeSeconds').isInt({ min: 1 }),
    body('path').isArray({ min: 1 }),
  ];

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ status: 'error', errors: errors.array() });
      return;
    }

    try {
      const response = await submitResultUseCase.execute(req.body);
      res.status(response.alreadySubmitted ? 200 : 201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const resultController = new ResultController();
