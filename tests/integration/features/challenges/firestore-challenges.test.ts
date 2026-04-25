import { generateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { challengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { wikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';

jest.mock('@features/challenges/data/firestore-challenges.repository');
jest.mock('@features/challenges/data/wikipedia-feed.service');

describe('GenerateChallengeUseCase Integration', () => {
  it('should verify batch generation persists', async () => {
    (challengesRepository.save as jest.Mock).mockResolvedValue(undefined);
    (challengesRepository.findById as jest.Mock).mockResolvedValue(null);
    
    // Mock BFS logic
    jest.spyOn(generateChallengeUseCase, 'findShortestPath').mockResolvedValue(3);

    const startDate = new Date('2026-04-20');
    await generateChallengeUseCase.generateMonthlyBatch(startDate);

    expect(challengesRepository.save).toHaveBeenCalled();
  }, 60000);
});
