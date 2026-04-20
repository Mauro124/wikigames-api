import request from 'supertest';
import { app, server } from '../src/index';

// Mock Firebase Config
jest.mock('../src/config/firebase.config', () => {
  const mockCollection = {
    doc: jest.fn((id: string) => ({
      get: jest.fn().mockResolvedValue({
        exists: !id.includes('_'), // true for stats (e.g., '2024-05-24'), false for results ('2024-05-24_user123')
        id: id,
        data: () => ({
          id: id,
          totalWins: 10,
          sumClicks: 150,
          sumTime: 600,
          distribution: { '10': 5, '20': 5 },
        }),
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
