import { generateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { challengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { wikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';
import { categoriesRepository } from '@features/challenges/data/firestore-categories.repository';

jest.mock('@features/challenges/data/firestore-challenges.repository');
jest.mock('@features/challenges/data/wikipedia-feed.service');
jest.mock('@features/challenges/data/firestore-categories.repository');

describe('GenerateChallengeUseCase', () => {
  it('should generate challenges', async () => {
    (categoriesRepository.findAll as jest.Mock).mockResolvedValue([{ name: 'Science', active: true }]);
    (wikipediaFeedService.getRandomArticlesFromCategory as jest.Mock).mockResolvedValue(['A', 'B', 'C', 'D']);
    (wikipediaFeedService.getLinksForPage as jest.Mock).mockResolvedValue(['B']);
    (challengesRepository.save as jest.Mock).mockResolvedValue(undefined);
    
    const startDate = new Date('2026-04-20');
    const total = await generateChallengeUseCase.generateMonthlyBatch(startDate);
    
    expect(total).toBeGreaterThan(0);
  });
});
