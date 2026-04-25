import { generateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { challengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { wikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';
import { OBJECTIVES } from '@features/challenges/domain/objectives';
import { STARTERS } from '@features/challenges/domain/starters';

jest.mock('@features/challenges/data/firestore-challenges.repository');
jest.mock('@features/challenges/data/wikipedia-feed.service');

describe('GenerateChallengeUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    (challengesRepository.save as jest.Mock).mockResolvedValue(undefined);
  });

  it('should generate challenges with fixed daily targets from OBJECTIVES and starts from STARTERS', async () => {
    const lang = 'en';
    const expectedTarget = OBJECTIVES[lang][0];
    const expectedStart = STARTERS[lang][0];

    // Mock BFS to find a path for the first day's target
    jest.spyOn(generateChallengeUseCase, 'findShortestPath').mockResolvedValue(3);

    const startDate = new Date('2026-04-20');
    const total = await generateChallengeUseCase.generateMonthlyBatch(startDate, lang);

    expect(total).toBeGreaterThan(0);
    
    expect(challengesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        targetTitle: expectedTarget,
        challenges: expect.arrayContaining([
          expect.objectContaining({ 
            endTitle: expectedTarget, 
            startTitle: expect.any(String),
            minClicks: 3 
          })
        ])
      })
    );
  });
});
