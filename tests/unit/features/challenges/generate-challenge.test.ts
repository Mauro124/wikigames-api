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
      getLinksForPage: jest.fn().mockResolvedValue([]),
      getBacklinksForPage: jest.fn().mockResolvedValue([]),
      getRandomArticlesFromCategory: jest.fn(),
      getPageExtract: jest.fn().mockResolvedValue('Mock Description'),
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

    const pathSpy = jest.spyOn(useCase, 'findShortestPath').mockResolvedValue(['A', 'B', 'C', 'D']);

    const result = await useCase.generateForDate(date, lang);

    expect(result.count).toBe(10);
    expect(result.usedId).toBe('obj1');
    expect(mockObjectivesRepo.findNextForLang).toHaveBeenCalledWith(lang, []);
    expect(mockObjectivesRepo.markAsUsed).toHaveBeenCalledWith('obj1');
    expect(mockWikiFeed.getPageExtract).toHaveBeenCalledWith(lang, expectedTarget);
    expect(mockChallengesRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '2026-04-20',
        targetTitle: expectedTarget,
        targetDescription: 'Mock Description',
        challenges: expect.arrayContaining([
          expect.objectContaining({
            perfectPath: ['A', 'B', 'C', 'D'],
            minClicks: 3,
          }),
        ]),
      }),
    );

    pathSpy.mockRestore();
  });

  it('should generate monthly batch by calling generateForDate 30 times and passing exclude lists', async () => {
    const lang = 'en';
    const generateSpy = jest.spyOn(useCase, 'generateForDate').mockImplementation(async (date, l, exIds, exTitles) => {
      const dateStr = date.toISOString().split('T')[0];
      return { count: 10, usedId: `obj-${dateStr}`, usedTitle: `Title-${dateStr}` };
    });

    const startDate = new Date('2026-04-01');
    const total = await useCase.generateMonthlyBatch(startDate, lang);

    expect(total).toBe(300);
    expect(generateSpy).toHaveBeenCalledTimes(30);

    // Check first call (no exclusions)
    expect(generateSpy).toHaveBeenNthCalledWith(1, new Date('2026-04-01'), lang, [], []);
    
    // Check second call (first objective excluded by ID and Title)
    expect(generateSpy).toHaveBeenNthCalledWith(2, new Date('2026-04-02'), lang, ['obj-2026-04-01'], ['Title-2026-04-01']);

    generateSpy.mockRestore();
  });

  it('should skip generation if no unique objective is found in repository', async () => {
    const lang = 'en';
    mockObjectivesRepo.findNextForLang.mockResolvedValue(null);

    const date = new Date('2026-04-20');
    const result = await useCase.generateForDate(date, lang);

    expect(result.count).toBe(0);
    expect(result.usedId).toBeNull();
    expect(result.usedTitle).toBeNull();
    expect(mockChallengesRepo.save).not.toHaveBeenCalled();
  });

  it('should skip objectives with titles already used in the same batch', async () => {
    const lang = 'en';
    const date = new Date('2026-04-20');

    // First call returns a duplicate title
    mockObjectivesRepo.findNextForLang
      .mockResolvedValueOnce({ id: 'id1', title: 'Already Used', lang: 'en' })
      .mockResolvedValueOnce({ id: 'id2', title: 'Fresh Title', lang: 'en' });

    const result = await useCase.generateForDate(date, lang, [], ['Already Used']);

    expect(result.usedId).toBe('id2');
    expect(result.usedTitle).toBe('Fresh Title');
    expect(mockObjectivesRepo.findNextForLang).toHaveBeenCalledTimes(2);
  });

  it('should skip generation but mark objective as used if no paths are found', async () => {
    const lang = 'en';
    const date = new Date('2026-04-20');

    // Mock no paths found
    jest.spyOn(useCase, 'findShortestPath').mockResolvedValue(null);

    const result = await useCase.generateForDate(date, lang);

    expect(result.count).toBe(0);
    expect(result.usedId).toBe('obj1');
    expect(result.usedTitle).toBe('Target from Repo');
    expect(mockChallengesRepo.save).not.toHaveBeenCalled();
    // CRITICAL: Must be marked as used to avoid getting stuck
    expect(mockObjectivesRepo.markAsUsed).toHaveBeenCalledWith('obj1');
  });

  describe('calculateDifficulty', () => {
    it('should return Easy for 1-2 clicks', () => {
      expect(useCase.calculateDifficulty(1)).toBe('Easy');
      expect(useCase.calculateDifficulty(2)).toBe('Easy');
    });

    it('should return Medium for 3-4 clicks', () => {
      expect(useCase.calculateDifficulty(3)).toBe('Medium');
      expect(useCase.calculateDifficulty(4)).toBe('Medium');
    });

    it('should return Hard for 5+ clicks', () => {
      expect(useCase.calculateDifficulty(5)).toBe('Hard');
      expect(useCase.calculateDifficulty(10)).toBe('Hard');
    });
  });
});
