import { SubmitResultUseCase } from '../../../../src/features/results/domain/submit-result.usecase';
import { AppError } from '@shared/domain/app-error';

describe('SubmitResultUseCase', () => {
  let useCase: SubmitResultUseCase;
  let mockResultsRepo: any;
  let mockChallengesRepo: any;
  let mockStatsRepo: any;
  let mockUpdateUserStatsUseCase: any;
  let mockGetStatsUseCase: any;
  let mockShareVisualizer: any;

  const validResult = {
    challengeId: '2024-06-01_0',
    userId: 'user123',
    clicks: 5,
    timeSeconds: 60,
    path: ['A', 'B', 'C'],
    lang: 'en',
  };

  beforeEach(() => {
    mockResultsRepo = {
      exists: jest.fn(),
      save: jest.fn(),
    };
    mockChallengesRepo = {
      findByIdAndLang: jest.fn(),
    };
    mockStatsRepo = {
      incrementStats: jest.fn(),
    };
    mockUpdateUserStatsUseCase = {
      execute: jest.fn(),
    };
    mockGetStatsUseCase = {
      execute: jest.fn(),
    };
    mockShareVisualizer = {
      generate: jest.fn().mockReturnValue('mock share text'),
    };

    useCase = new SubmitResultUseCase(
      mockResultsRepo,
      mockChallengesRepo,
      mockStatsRepo,
      mockUpdateUserStatsUseCase,
      mockGetStatsUseCase,
      mockShareVisualizer,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save result and increment stats if not duplicate', async () => {
    mockResultsRepo.exists.mockResolvedValue(false);
    mockResultsRepo.save.mockResolvedValue(undefined);
    mockStatsRepo.incrementStats.mockResolvedValue(undefined);
    mockGetStatsUseCase.execute.mockResolvedValue({ averageClicks: 10 });
    mockChallengesRepo.findByIdAndLang.mockResolvedValue({
      challenges: [{ difficulty: 'Hard' }],
    });

    const response = await useCase.execute(validResult as any);

    expect(response.success).toBe(true);
    expect(response.shareText).toBe('mock share text');
    expect(mockResultsRepo.exists).toHaveBeenCalledWith('2024-06-01_0', 'user123');
    expect(mockResultsRepo.save).toHaveBeenCalledWith(validResult);
    expect(mockStatsRepo.incrementStats).toHaveBeenCalledWith('2024-06-01_0', 5, 60, undefined);
    expect(mockUpdateUserStatsUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'Hard' }),
    );
  });

  it('should save result and increment totalLosses if isSurrender is true', async () => {
    mockResultsRepo.exists.mockResolvedValue(false);
    mockResultsRepo.save.mockResolvedValue(undefined);
    mockStatsRepo.incrementStats.mockResolvedValue(undefined);

    const surrenderResult = { ...validResult, isSurrender: true };
    const response = await useCase.execute(surrenderResult as any);

    expect(response.success).toBe(true);
    expect(response.shareText).toBeUndefined(); // No share text for surrenders
    expect(mockResultsRepo.save).toHaveBeenCalledWith(surrenderResult);
    expect(mockStatsRepo.incrementStats).toHaveBeenCalledWith('2024-06-01_0', 5, 60, true);
  });

  it('should return alreadySubmitted if result exists', async () => {
    mockResultsRepo.exists.mockResolvedValue(true);

    const response = await useCase.execute(validResult as any);

    expect(response).toEqual({ success: true, alreadySubmitted: true });
    expect(mockResultsRepo.save).not.toHaveBeenCalled();
    expect(mockStatsRepo.incrementStats).not.toHaveBeenCalled();
  });

  it('should reject missing challengeId or userId', async () => {
    await expect(useCase.execute({ ...validResult, challengeId: '' } as any)).rejects.toThrow(
      AppError,
    );

    await expect(useCase.execute({ ...validResult, userId: '' } as any)).rejects.toThrow(AppError);
  });

  it('should reject clicks < 1', async () => {
    await expect(useCase.execute({ ...validResult, clicks: 0 } as any)).rejects.toThrow(AppError);
  });

  it('should reject timeSeconds < 1', async () => {
    await expect(useCase.execute({ ...validResult, timeSeconds: 0 } as any)).rejects.toThrow(
      AppError,
    );
  });
});
