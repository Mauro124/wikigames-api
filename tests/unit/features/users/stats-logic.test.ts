import { UpdateUserStatsUseCase } from '../../../../src/features/users/domain/update-user-stats.usecase';
import { userRepository } from '../../../../src/features/users/data/firestore-user.repository';

jest.mock('../../../../src/features/users/data/firestore-user.repository');

describe('UpdateUserStatsUseCase logic', () => {
  let useCase: UpdateUserStatsUseCase;

  beforeEach(() => {
    useCase = new UpdateUserStatsUseCase();
    jest.clearAllMocks();
  });

  const mockUser = (stats: any) => ({
    id: 'user-1',
    stats,
  });

  it('should start streak at 1 if first time playing', async () => {
    const user = mockUser({ currentStreak: 0, lastPlayedDate: null, longestStreak: 0 });
    (userRepository.findById as jest.Mock).mockResolvedValue(user);

    await useCase.execute({ userId: 'user-1', challengeId: '2026-04-21', clicks: 5, timeSeconds: 100 });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', expect.objectContaining({
      stats: expect.objectContaining({ currentStreak: 1, lastPlayedDate: '2026-04-21' })
    }));
  });

  it('should increment streak if played yesterday', async () => {
    const user = mockUser({ currentStreak: 1, lastPlayedDate: '2026-04-20', longestStreak: 1 });
    (userRepository.findById as jest.Mock).mockResolvedValue(user);

    await useCase.execute({ userId: 'user-1', challengeId: '2026-04-21', clicks: 5, timeSeconds: 100 });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', expect.objectContaining({
      stats: expect.objectContaining({ currentStreak: 2, longestStreak: 2 })
    }));
  });

  it('should reset streak to 1 if a day was skipped', async () => {
    const user = mockUser({ currentStreak: 5, lastPlayedDate: '2026-04-10', longestStreak: 5 });
    (userRepository.findById as jest.Mock).mockResolvedValue(user);

    await useCase.execute({ userId: 'user-1', challengeId: '2026-04-21', clicks: 5, timeSeconds: 100 });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', expect.objectContaining({
      stats: expect.objectContaining({ currentStreak: 1, longestStreak: 5 })
    }));
  });

  it('should update bestTime if new record is achieved', async () => {
    const user = mockUser({ bestTimeSeconds: 100, currentStreak: 1, lastPlayedDate: '2026-04-21' });
    (userRepository.findById as jest.Mock).mockResolvedValue(user);

    await useCase.execute({ userId: 'user-1', challengeId: '2026-04-21', clicks: 5, timeSeconds: 50 });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', expect.objectContaining({
      stats: expect.objectContaining({ bestTimeSeconds: 50 })
    }));
  });
});
