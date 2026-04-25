import { UpdateUserStatsUseCase } from '../../../../src/features/users/domain/update-user-stats.usecase';

describe('UpdateUserStatsUseCase logic', () => {
  let useCase: UpdateUserStatsUseCase;
  let mockUserRepo: any;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdateUserStatsUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  const mockUser = (stats: any, playedGames: string[] = []) => ({
    id: 'user-1',
    stats,
    playedGames,
  });

  it('should start streak at 1 if first time playing', async () => {
    const user = mockUser({ currentStreak: 0, lastPlayedDate: null, longestStreak: 0 });
    mockUserRepo.findById.mockResolvedValue(user);

    await useCase.execute({
      userId: 'user-1',
      challengeId: '2026-04-21',
      lang: 'en',
      clicks: 5,
      timeSeconds: 100,
    });

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        stats: expect.objectContaining({ currentStreak: 1, lastPlayedDate: '2026-04-21' }),
        playedGames: ['2026-04-21_en'],
      }),
    );
  });

  it('should increment streak if played yesterday', async () => {
    const user = mockUser({ currentStreak: 1, lastPlayedDate: '2026-04-20', longestStreak: 1 });
    mockUserRepo.findById.mockResolvedValue(user);

    await useCase.execute({
      userId: 'user-1',
      challengeId: '2026-04-21',
      lang: 'en',
      clicks: 5,
      timeSeconds: 100,
    });

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        stats: expect.objectContaining({ currentStreak: 2, longestStreak: 2 }),
        playedGames: ['2026-04-21_en'],
      }),
    );
  });

  it('should reset streak to 0 and track game if surrendered', async () => {
    const user = mockUser({ currentStreak: 5, lastPlayedDate: '2026-04-20', longestStreak: 5 });
    mockUserRepo.findById.mockResolvedValue(user);

    await useCase.execute({
      userId: 'user-1',
      challengeId: '2026-04-21',
      lang: 'en',
      clicks: 99,
      timeSeconds: 1000,
      isSurrender: true,
    });

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        stats: expect.objectContaining({ currentStreak: 0, totalLosses: 1 }),
        playedGames: ['2026-04-21_en'],
      }),
    );
  });
});
