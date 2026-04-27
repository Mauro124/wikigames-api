import { GenerateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { FirestoreChallengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { FirestoreObjectivesRepository } from '@features/challenges/data/firestore-objectives.repository';
import { WikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';

jest.mock('@features/challenges/data/firestore-challenges.repository');
jest.mock('@features/challenges/data/firestore-objectives.repository');
jest.mock('@features/challenges/data/wikipedia-feed.service');

describe('GenerateChallengeUseCase Integration', () => {
  let generateChallengeUseCase: GenerateChallengeUseCase;
  let challengesRepository: jest.Mocked<FirestoreChallengesRepository>;
  let objectivesRepository: jest.Mocked<FirestoreObjectivesRepository>;
  let wikipediaFeedService: jest.Mocked<WikipediaFeedService>;

  beforeEach(() => {
    challengesRepository = new FirestoreChallengesRepository() as any;
    objectivesRepository = new FirestoreObjectivesRepository() as any;
    wikipediaFeedService = new WikipediaFeedService() as any;

    generateChallengeUseCase = new GenerateChallengeUseCase(
      wikipediaFeedService,
      challengesRepository,
      objectivesRepository,
    );
  });

  it('should verify batch generation persists', async () => {
    challengesRepository.save.mockResolvedValue(undefined);
    objectivesRepository.findNextForLang.mockResolvedValue({
      id: 'test-obj',
      title: 'Test Target',
    } as any);
    objectivesRepository.markAsUsed.mockResolvedValue(undefined);

    // Mock BFS logic
    jest.spyOn(generateChallengeUseCase, 'findShortestPath').mockResolvedValue(3);

    const startDate = new Date('2026-04-20');
    await generateChallengeUseCase.generateMonthlyBatch(startDate);

    expect(challengesRepository.save).toHaveBeenCalled();
  }, 60000);
});
