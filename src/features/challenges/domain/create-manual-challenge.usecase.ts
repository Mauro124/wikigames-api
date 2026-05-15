import { Challenge, SingleChallenge } from './challenge.entity';
import { GenerateChallengeUseCase } from './generate-challenge.usecase';
import { ChallengesRepository } from './challenges.repository';
import { AppError } from '@shared/domain/app-error';
import { logger } from '@shared/services/logger.service';

export interface ManualChallengeDto {
  id: string; // YYYY-MM-DD
  lang: string;
  targetTitle?: string;
  challenges: {
    startTitle: string;
    endTitle: string;
  }[];
}

export class CreateManualChallengeUseCase {
  constructor(
    private readonly generateChallengeUseCase: GenerateChallengeUseCase,
    private readonly challengesRepository: ChallengesRepository,
  ) {}

  async execute(dto: ManualChallengeDto): Promise<Challenge> {
    const { id, lang, targetTitle, challenges } = dto;

    if (!id || !lang || !challenges || challenges.length === 0) {
      throw new AppError('Missing required fields', 400);
    }

    const verifiedChallenges: SingleChallenge[] = [];

    for (let i = 0; i < challenges.length; i++) {
      const { startTitle, endTitle } = challenges[i];

      logger.info(`Verifying manual challenge ${i + 1} (${lang}): ${startTitle} -> ${endTitle}`);

      const path = await this.generateChallengeUseCase.findShortestPath(
        lang,
        startTitle,
        endTitle,
      );

      if (!path || path.length === 0) {
        throw new AppError(
          `No path found for challenge ${i + 1} in language "${lang}": ${startTitle} -> ${endTitle}`,
          400,
        );
      }

      const minClicks = path.length - 1;

      verifiedChallenges.push({
        id: i + 1,
        startTitle,
        endTitle,
        minClicks,
        difficulty: this.generateChallengeUseCase.calculateDifficulty(minClicks),
        perfectPath: path,
      });
    }

    const challenge: Challenge = {
      id,
      lang,
      targetTitle: targetTitle || challenges[0].endTitle,
      challenges: verifiedChallenges,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.challengesRepository.save(challenge);
    logger.info({ msg: 'Manual challenge created', id: challenge.id, lang: challenge.lang });

    return challenge;
  }
}
