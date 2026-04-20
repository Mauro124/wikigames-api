import { generateChallengeUseCase } from '../../../../src/features/challenges/domain/generate-challenge.usecase';
import { wikipediaFeedService } from '../../../../src/features/challenges/data/wikipedia-feed.service';

jest.mock('../../../../src/features/challenges/data/wikipedia-feed.service');

describe('GenerateChallengeUseCase (Reachability)', () => {
  const lang = 'en';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if end is reachable within 2 levels', async () => {
    const start = 'A';
    const end = 'C';

    // Graph: A -> B -> C
    (wikipediaFeedService.getLinksForPage as jest.Mock)
      .mockResolvedValueOnce(['B']) // Level 0: A has links [B]
      .mockResolvedValueOnce(['C']); // Level 1: B has links [C]

    const result = await generateChallengeUseCase.isReachable(lang, start, end);
    expect(result).toBe(true);
    expect(wikipediaFeedService.getLinksForPage).toHaveBeenCalledTimes(2);
  });

  it('should return false if end is unreachable within depth 6', async () => {
    const start = 'A';
    const end = 'Z';

    // Chain longer than 6
    (wikipediaFeedService.getLinksForPage as jest.Mock).mockResolvedValue(['Next']);

    const result = await generateChallengeUseCase.isReachable(lang, start, end);
    expect(result).toBe(false);
  });

  it('should avoid infinite loops and circular paths', async () => {
    const start = 'A';
    const end = 'Z';

    // Graph: A -> B -> A (Circular)
    (wikipediaFeedService.getLinksForPage as jest.Mock)
      .mockResolvedValueOnce(['B'])
      .mockResolvedValueOnce(['A']);

    const result = await generateChallengeUseCase.isReachable(lang, start, end);
    expect(result).toBe(false);
  });
});
