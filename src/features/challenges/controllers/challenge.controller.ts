import { Request, Response, NextFunction } from 'express';
import { ChallengesRepository } from '../domain/challenges.repository';

export class ChallengeController {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  /**
   * Returns the challenge(s) for the current day based on language.
   */
  async getToday(req: Request, res: Response, next: NextFunction): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const lang = (req.query.lang as string) || 'en';

    try {
      const challenge = await this.challengesRepository.findByIdAndLang(today, lang);

      if (!challenge) {
        res.status(404).json({
          status: 'error',
          message: `No challenge found for today (${today}) in language "${lang}"`,
        });
        return;
      }

      res.status(200).json(challenge);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns a list of recent daily challenges for a specific language.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const lang = (req.query.lang as string) || 'en';
    try {
      const challenges = await this.challengesRepository.findAllByLang(lang);
      // Sort by ID (date) descending and take last 7
      const recent = challenges.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 7);

      res.status(200).json(recent);
    } catch (error) {
      next(error);
    }
  }
}
