import request from 'supertest';
import { app, server } from '../src/index';
import { SubmitResultUseCase } from '../src/features/results/domain/submit-result.usecase';
import { GetStatsUseCase } from '../src/features/stats/domain/get-stats.usecase';

jest.mock('../src/features/results/domain/submit-result.usecase');
jest.mock('../src/features/stats/domain/get-stats.usecase');

describe('Stats flow', () => {
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

  it('should accept valid results', async () => {
    (SubmitResultUseCase.prototype.execute as jest.Mock).mockResolvedValue({
      success: true,
      shareText: 'WikiGame 2024-05-24 - 5 clicks',
    });

    const payload = {
      challengeId: '2024-05-24_0',
      userId: 'test-user-id',
      lang: 'en',
      clicks: 5,
      timeSeconds: 120,
      path: ['A', 'B', 'C'],
    };

    const response = await request(app).post('/results').send(payload);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('should reject invalid results', async () => {
    const payload = { clicks: 0, challengeId: '123', userId: 'abc', timeSeconds: 10, path: ['A'] };
    const response = await request(app).post('/results').send(payload);
    // 400 because of express-validator
    expect(response.status).toBe(400);
  });

  it('should get stats with dynamic averages', async () => {
    const mockStats = {
      id: '2024-05-24_0',
      totalWins: 10,
      sumClicks: 150,
      sumTime: 600,
      averageClicks: 15,
      averageTime: 60,
      distribution: { '10': 5, '20': 5 },
    };

    (GetStatsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockStats);

    const response = await request(app).get('/challenges/2024-05-24_0/stats');
    expect(response.status).toBe(200);
    expect(response.body.averageClicks).toBe(15);
    expect(response.body.averageTime).toBe(60);
  });
});
