import { GenerateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { ChallengesRepository } from '@features/challenges/domain/challenges.repository';
import { ObjectivesRepository } from '@features/challenges/domain/objectives.repository';
import { WikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';

describe('GenerateChallengeUseCase', () => {
  let useCase: GenerateChallengeUseCase;
  let mockChallengesRepo: jest.Mocked<ChallengesRepository>;
  let mockObjectivesRepo: jest.Mocked<ObjectivesRepository>;
  let mockWikiFeed: jest.Mocked<WikipediaFeedService>;

  beforeEach(() => {
    mockChallengesRepo = {
      save: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockObjectivesRepo = {
      findNextForLang: jest.fn(),
      markAsUsed: jest.fn(),
      save: jest.fn(),
    } as any;

    mockWikiFeed = {
      getLinksForPage: jest.fn(),
      getBacklinksForPage: jest.fn(),
      getRandomArticlesFromCategory: jest.fn(),
    } as any;

    useCase = new GenerateChallengeUseCase(mockWikiFeed, mockChallengesRepo, mockObjectivesRepo);

    // Default mocks
    mockChallengesRepo.save.mockResolvedValue(undefined);
    mockObjectivesRepo.findNextForLang.mockResolvedValue({
      id: 'obj1',
      title: 'Target from Repo',
      lang: 'en',
    });
    mockObjectivesRepo.markAsUsed.mockResolvedValue(undefined);
  });

  it('should generate challenges for a specific date', async () => {
    const lang = 'en';
    const expectedTarget = 'Target from Repo';
    const date = new Date('2026-04-20');

    const pathSpy = jest.spyOn(useCase, 'findShortestPath').mockResolvedValue(3);

    const count = await useCase.generateForDate(date, lang);

    expect(count).toBe(10);
    expect(mockObjectivesRepo.findNextForLang).toHaveBeenCalledWith(lang);
    expect(mockObjectivesRepo.markAsUsed).toHaveBeenCalledWith('obj1');
    expect(mockChallengesRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '2026-04-20',
        targetTitle: expectedTarget,
      }),
    );

    pathSpy.mockRestore();
  });

  it('should generate monthly batch by calling generateForDate 30 times', async () => {
    const lang = 'en';
    const generateSpy = jest.spyOn(useCase, 'generateForDate').mockResolvedValue(10);

    const startDate = new Date('2026-04-01');
    const total = await useCase.generateMonthlyBatch(startDate, lang);

    expect(total).toBe(300);
    expect(generateSpy).toHaveBeenCalledTimes(30);

    // Check first and last call dates
    expect(generateSpy).toHaveBeenNthCalledWith(1, new Date('2026-04-01'), lang);
    expect(generateSpy).toHaveBeenNthCalledWith(30, new Date('2026-04-30'), lang);

    generateSpy.mockRestore();
  });

  it('should skip generation if no objective is found in repository', async () => {
    const lang = 'en';
    mockObjectivesRepo.findNextForLang.mockResolvedValue(null);

    const date = new Date('2026-04-20');
    const count = await useCase.generateForDate(date, lang);

    expect(count).toBe(0);
    expect(mockChallengesRepo.save).not.toHaveBeenCalled();
  });
});
