import request from 'supertest';
// Mock Firebase Config
jest.mock('../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        add: jest.fn(() => Promise.resolve()),
        where: jest.fn(() => ({ get: jest.fn(() => Promise.resolve({ docs: [] })) })),
      })),
    })),
  },
  admin: { firestore: { FieldValue: { serverTimestamp: jest.fn(), increment: (v: any) => v } } },
}));

// Mock verifyAuth
jest.mock('../src/middleware/verify-auth.middleware', () => ({
  verifyAuth: (req: any, res: any, next: any) => {
    req.user = { uid: 'test-user-id' };
    next();
  },
}));

import { app, server } from '../src/index';

describe('Stats flow', () => {
  afterAll(() => {
    server.close();
  });

  it('should accept valid results', async () => {
    const payload = {
      challengeId: '2024-05-24',
      deviceId: 'test-device',
      clicks: 5,
      timeSeconds: 120,
      path: ['A', 'B', 'C'],
    };

    const response = await request(app).post('/results').send(payload);
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
  });

  it('should reject invalid results', async () => {
    const payload = { clicks: 0 };
    const response = await request(app).post('/results').send(payload);
    expect(response.status).toBe(400);
  });
});
