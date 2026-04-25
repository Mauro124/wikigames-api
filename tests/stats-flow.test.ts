import request from 'supertest';
import { app, server } from '../src/index';

// Mock Firebase Config
jest.mock('../src/config/firebase.config', () => {
  const mockCollection = {
    doc: jest.fn((id: string) => ({
      get: jest.fn().mockImplementation(async () => {
        const isResult = id.includes('_');
        return {
          exists: !isResult, // results don't exist yet, stats and users do
          id: id,
          data: () => {
            if (isResult) return {};
            if (id.match(/^\d{4}-\d{2}-\d{2}$/)) { // stats
              return {
                id,
                totalWins: 10,
                sumClicks: 150,
                sumTime: 600,
                distribution: { '10': 5, '20': 5 },
              };
            }
            return { // users
              id,
              username: 'test_user',
              stats: { currentStreak: 1, totalGames: 1, totalWins: 1, totalLosses: 0 },
              playedGames: [],
            };
          },
        };
      }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
    })),
    where: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ docs: [] }),
    }),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: '2024-05-24',
          data: () => ({
            id: '2024-05-24',
            totalWins: 10,
            sumClicks: 150,
            sumTime: 600,
            distribution: { '10': 5, '20': 5 },
          }),
        },
      ],
    }),
  };

  return {
    db: {
      collection: jest.fn().mockReturnValue(mockCollection),
    },
    admin: { firestore: { FieldValue: { serverTimestamp: jest.fn(), increment: (v: any) => v } } },
  };
});

describe('Stats flow', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should accept valid results', async () => {
    const payload = {
      challengeId: '2024-05-24',
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
    expect(response.status).toBe(400);
  });

  it('should get stats with dynamic averages', async () => {
    const response = await request(app).get('/challenges/2024-05-24/stats');
    expect(response.status).toBe(200);
    expect(response.body.averageClicks).toBe(15);
    expect(response.body.averageTime).toBe(60);
  });
});
