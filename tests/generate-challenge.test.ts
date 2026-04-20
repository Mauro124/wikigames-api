import { GenerateChallengeUseCase } from '../src/features/challenges/domain/generate-challenge.usecase';
import { wikipediaFeedService } from '../src/features/challenges/data/wikipedia-feed.service';
import { challengesRepository } from '../src/features/challenges/data/firestore-challenges.repository';

// Mock Firebase Config globally to avoid init errors
jest.mock('../src/config/firebase.config', () => ({
  db: { collection: jest.fn() },
  admin: { firestore: { FieldValue: { serverTimestamp: jest.fn() } } },
}));

jest.mock('../src/features/challenges/data/wikipedia-feed.service');
jest.mock('../src/features/challenges/data/firestore-challenges.repository');

describe('GenerateChallengeUseCase', () => {
  const useCase = new GenerateChallengeUseCase();

  it('should filter out forbidden articles', async () => {
    const mockFeed = {
      tfa: { title: 'Valid_End' },
      mostread: {
        articles: [
          { article: 'Main_Page' },
          { article: 'List_of_something' },
          { article: 'Valid_Start' },
        ],
      },
    };

    (wikipediaFeedService.fetchFeed as jest.Mock).mockResolvedValue(mockFeed);
    (challengesRepository.findById as jest.Mock).mockResolvedValue(null);
    (challengesRepository.save as jest.Mock).mockResolvedValue(undefined);

    const result = await useCase.execute('2024-05-25');

    expect(result.startTitle).toBe('Valid_Start');
    expect(result.endTitle).toBe('Valid_End');
  });
});
