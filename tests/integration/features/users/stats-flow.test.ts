import request from 'supertest';
import { app, server } from '../../../../src/index';
import { SubmitResultUseCase } from '../../../../src/features/results/domain/submit-result.usecase';
import { GetUserUseCase } from '../../../../src/features/users/domain/get-user.usecase';

jest.mock('../../../../src/features/results/domain/submit-result.usecase');
jest.mock('../../../../src/features/users/domain/get-user.usecase');

describe('User Stats Flow', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user stats when result is submitted', async () => {
    (SubmitResultUseCase.prototype.execute as jest.Mock).mockResolvedValue({
      success: true,
      shareText: 'WikiGame 2026-04-21 - 5 clicks ⏱️ 0:50\n\n🔵 🟩 🟩 🔵',
    });

    const payload = {
      challengeId: '2026-04-21',
      userId: 'test-uid',
      lang: 'en',
      clicks: 5,
      timeSeconds: 50,
      path: ['A', 'B'],
    };

    const response = await request(app).post('/results').send(payload);

    expect(response.status).toBe(201);
    expect(SubmitResultUseCase.prototype.execute).toHaveBeenCalled();
  });

  it('should retrieve user stats via API', async () => {
    const stats = { currentStreak: 2, bestTimeSeconds: 50, totalGames: 2 };
    (GetUserUseCase.prototype.execute as jest.Mock).mockResolvedValue({
      id: 'test-uid',
      stats,
    });

    const response = await request(app).get('/users/test-uid/stats');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(stats);
  });
});
