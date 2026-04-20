import { Request, Response, NextFunction } from 'express';
import { generateChallengeUseCase } from '../domain/generate-challenge.usecase';

export class InternalChallengeController {
  async generate(req: Request, res: Response, next: NextFunction) {
    const { date, force } = req.body;

    try {
      const challenge = await generateChallengeUseCase.execute(date, force);
      res.status(200).json({
        status: 'success',
        challenge,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const internalChallengeController = new InternalChallengeController();
