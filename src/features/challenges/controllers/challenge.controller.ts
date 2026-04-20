import { Request, Response, NextFunction } from 'express';
import { challengesRepository } from '../data/firestore-challenges.repository';
import { logger } from '@shared/services/logger.service';

export class ChallengeController {
  async getToday(req: Request, res: Response, next: NextFunction) {
    const today = new Date().toISOString().split('T')[0];
    logger.info({ msg: 'Requesting challenge for today', today });

    try {
      let challenge = await challengesRepository.findById(today);
      
      if (!challenge) {
        logger.warn({ msg: 'Challenge for today not found, searching for latest', today });
        const snapshot = await (challengesRepository as any).collection
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
          
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          challenge = { id: doc.id, ...doc.data() };
        }
      }

      if (!challenge) {
        return res.status(404).json({ status: 'error', message: 'No challenges found' });
      }
      res.status(200).json(challenge);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const snapshot = await (challengesRepository as any).collection
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();
        
      const challenges = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(challenges);
    } catch (error) {
      next(error);
    }
  }
}

export const challengeController = new ChallengeController();
