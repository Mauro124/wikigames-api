import { GenerateChallengeUseCase } from '../../../../src/features/challenges/domain/generate-challenge.usecase';
import { wikipediaFeedService } from '../../../../src/features/challenges/data/wikipedia-feed.service';

jest.mock('../../../../src/features/challenges/data/wikipedia-feed.service');
jest.mock('../../../../src/features/challenges/data/firestore-challenges.repository');

describe('Bidirectional BFS (findShortestPath)', () => {
  let useCase: GenerateChallengeUseCase;

  beforeEach(() => {
    useCase = new GenerateChallengeUseCase();
    jest.clearAllMocks();
  });

  it('should find the shortest path between two articles', async () => {
    // Mock Graph:
    // A -> B -> C -> D
    //      B -> E -> D
    // A -> F -> D
    const graph: Record<string, string[]> = {
      A: ['B', 'F'],
      B: ['C', 'E'],
      C: ['D'],
      E: ['D'],
      F: ['D'],
    };

    const reverseGraph: Record<string, string[]> = {
      D: ['C', 'E', 'F'],
      C: ['B'],
      E: ['B'],
      F: ['A'],
      B: ['A'],
    };

    (wikipediaFeedService.getLinksForPage as jest.Mock).mockImplementation((_, title) =>
      Promise.resolve(graph[title] || []),
    );
    (wikipediaFeedService.getBacklinksForPage as jest.Mock).mockImplementation((_, title) =>
      Promise.resolve(reverseGraph[title] || []),
    );

    const result = await useCase.findShortestPath('en', 'A', 'D');

    // Shortest path: A -> F -> D (2 clicks)
    expect(result).toBe(2);
  });

  it('should return 0 if no path is found within limits', async () => {
    (wikipediaFeedService.getLinksForPage as jest.Mock).mockResolvedValue([]);
    (wikipediaFeedService.getBacklinksForPage as jest.Mock).mockResolvedValue([]);

    const result = await useCase.findShortestPath('en', 'A', 'Z');
    expect(result).toBe(0);
  });

  it('should return 1 for direct link', async () => {
    (wikipediaFeedService.getLinksForPage as jest.Mock).mockResolvedValue(['B']);
    (wikipediaFeedService.getBacklinksForPage as jest.Mock).mockResolvedValue(['A']);

    const result = await useCase.findShortestPath('en', 'A', 'B');
    expect(result).toBe(1);
  });
});
