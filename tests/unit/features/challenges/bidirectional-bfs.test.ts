import { GenerateChallengeUseCase } from '../../../../src/features/challenges/domain/generate-challenge.usecase';

jest.mock('../../../../src/features/challenges/data/wikipedia-feed.service');
jest.mock('../../../../src/features/challenges/data/firestore-challenges.repository');

describe('Bidirectional BFS (findShortestPath)', () => {
  let useCase: GenerateChallengeUseCase;
  let mockFeed: any;
  let mockRepo: any;
  let mockObjRepo: any;

  beforeEach(() => {
    mockFeed = {
      getLinksForPage: jest.fn(),
      getBacklinksForPage: jest.fn(),
    };
    mockRepo = {
      save: jest.fn(),
    };
    mockObjRepo = {
      findNextForLang: jest.fn(),
      markAsUsed: jest.fn(),
    };
    useCase = new GenerateChallengeUseCase(mockFeed, mockRepo, mockObjRepo);
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

    mockFeed.getLinksForPage.mockImplementation((_, title: string) =>
      Promise.resolve(graph[title] || []),
    );
    mockFeed.getBacklinksForPage.mockImplementation((_, title: string) =>
      Promise.resolve(reverseGraph[title] || []),
    );

    const result = await useCase.findShortestPath('en', 'A', 'D');

    // Shortest path: A -> F -> D (2 clicks)
    expect(result).toEqual(['A', 'F', 'D']);
  });

  it('should return null if no path is found within limits', async () => {
    mockFeed.getLinksForPage.mockResolvedValue([]);
    mockFeed.getBacklinksForPage.mockResolvedValue([]);

    const result = await useCase.findShortestPath('en', 'A', 'Z');
    expect(result).toBeNull();
  });

  it('should return 1 click path for direct link', async () => {
    mockFeed.getLinksForPage.mockResolvedValue(['B']);
    mockFeed.getBacklinksForPage.mockResolvedValue(['A']);

    const result = await useCase.findShortestPath('en', 'A', 'B');
    expect(result).toEqual(['A', 'B']);
  });
});
