import { getStatsUseCase } from '../../../../src/features/stats/domain/get-stats.usecase';
import { statsRepository } from '../../../../src/features/stats/data/firestore-stats.repository';

jest.mock('../../../../src/features/stats/data/firestore-stats.repository');

describe('GetStatsUseCase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if stats not found', async () => {
    (statsRepository.findById as jest.Mock).mockResolvedValue(null);

    const result = await getStatsUseCase.execute('not-found');
    expect(result).toBeNull();
  });

  it('should calculate averages correctly', async () => {
    const mockStats = {
      id: '2024-06-01_0',
      totalWins: 10,
      sumClicks: 150, // avg 15
      sumTime: 600, // avg 60
      distribution: { '10': 5, '20': 5 },
    };

    (statsRepository.findById as jest.Mock).mockResolvedValue(mockStats);

    const result = await getStatsUseCase.execute('2024-06-01_0');

    expect(result).toBeDefined();
    expect(result!.averageClicks).toBe(15);
    expect(result!.averageTime).toBe(60);
  });

  it('should handle zero totalWins gracefully', async () => {
    const mockStats = {
      id: '2024-06-01_0',
      totalWins: 0,
      sumClicks: 0,
      sumTime: 0,
      distribution: {},
    };

    (statsRepository.findById as jest.Mock).mockResolvedValue(mockStats);

    const result = await getStatsUseCase.execute('2024-06-01_0');

    expect(result).toBeDefined();
    expect(result!.averageClicks).toBe(0);
    expect(result!.averageTime).toBe(0);
  });
});
