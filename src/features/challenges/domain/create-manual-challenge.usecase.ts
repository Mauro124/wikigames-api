import { Challenge, SingleChallenge } from './challenge.entity';
import { generateChallengeUseCase } from './generate-challenge.usecase';
import { challengesRepository } from '../data/firestore-challenges.repository';
import { AppError } from '@shared/domain/app-error';
import { logger } from '@shared/services/logger.service';

export interface ManualChallengeDto {
  id: string; // YYYY-MM-DD
  lang: string;
  categoryStart: string;
  categoryEnd: string;
  challenges: {
    startTitle: string;
    endTitle: string;
  }[];
}

export class CreateManualChallengeUseCase {
  async execute(dto: ManualChallengeDto): Promise<Challenge> {
    const { id, lang, categoryStart, categoryEnd, challenges } = dto;

    if (!id || !lang || !categoryStart || !categoryEnd || !challenges || challenges.length === 0) {
      throw new AppError('Missing required fields', 400);
    }

    const verifiedChallenges: SingleChallenge[] = [];

    for (let i = 0; i < challenges.length; i++) {
      const { startTitle, endTitle } = challenges[i];
      
      logger.info(`Verifying manual challenge ${i + 1}: ${startTitle} -> ${endTitle}`);
      
      const minClicks = await generateChallengeUseCase.findShortestPath(lang, startTitle, endTitle);
      
      if (minClicks === 0) {
        throw new AppError(`No path found for challenge ${i + 1}: ${startTitle} -> ${endTitle}`, 400);
      }

      verifiedChallenges.push({
        id: i + 1,
        startTitle,
        endTitle,
        minClicks,
        difficulty: generateChallengeUseCase.calculateDifficulty(minClicks),
      });
    }

    const challenge: Challenge = {
      id,
      lang,
      categoryStart,
      categoryEnd,
      challenges: verifiedChallenges,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await challengesRepository.save(challenge);
    logger.info({ msg: 'Manual challenge created', id: challenge.id });
    
    return challenge;
  }
}

export const createManualChallengeUseCase = new CreateManualChallengeUseCase();
