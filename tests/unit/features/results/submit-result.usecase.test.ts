import { submitResultUseCase } from '../../../../src/features/results/domain/submit-result.usecase';
import { resultsRepository } from '../../../../src/features/results/data/firestore-results.repository';
import { statsRepository } from '../../../../src/features/stats/data/firestore-stats.repository';
import { AppError } from '@shared/domain/app-error';

jest.mock('../../../../src/features/results/data/firestore-results.repository');
jest.mock('../../../../src/features/stats/data/firestore-stats.repository');

describe('SubmitResultUseCase', () => {
  const validResult = {
    challengeId: '2024-06-01_0',
    userId: 'user123',
    clicks: 5,
    timeSeconds: 60,
    path: ['A', 'B', 'C'],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save result and increment stats if not duplicate', async () => {
    (resultsRepository.exists as jest.Mock).mockResolvedValue(false);
    (resultsRepository.save as jest.Mock).mockResolvedValue(undefined);
    (statsRepository.incrementStats as jest.Mock).mockResolvedValue(undefined);

    const response = await submitResultUseCase.execute(validResult as any);

    expect(response).toEqual({ success: true });
    expect(resultsRepository.exists).toHaveBeenCalledWith('2024-06-01_0', 'user123');
    expect(resultsRepository.save).toHaveBeenCalledWith(validResult);
    expect(statsRepository.incrementStats).toHaveBeenCalledWith('2024-06-01_0', 5, 60);
  });

  it('should return alreadySubmitted if result exists', async () => {
    (resultsRepository.exists as jest.Mock).mockResolvedValue(true);

    const response = await submitResultUseCase.execute(validResult as any);

    expect(response).toEqual({ success: true, alreadySubmitted: true });
    expect(resultsRepository.save).not.toHaveBeenCalled();
    expect(statsRepository.incrementStats).not.toHaveBeenCalled();
  });

  it('should reject missing challengeId or userId', async () => {
    await expect(
      submitResultUseCase.execute({ ...validResult, challengeId: '' } as any),
    ).rejects.toThrow(AppError);

    await expect(
      submitResultUseCase.execute({ ...validResult, userId: '' } as any),
    ).rejects.toThrow(AppError);
  });

  it('should reject clicks < 1', async () => {
    await expect(submitResultUseCase.execute({ ...validResult, clicks: 0 } as any)).rejects.toThrow(
      AppError,
    );
  });

  it('should reject timeSeconds < 1', async () => {
    await expect(
      submitResultUseCase.execute({ ...validResult, timeSeconds: 0 } as any),
    ).rejects.toThrow(AppError);
  });
});
