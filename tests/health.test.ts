import request from 'supertest';
// Mock Firebase Config globally to avoid init errors
jest.mock('../src/config/firebase.config', () => ({
  db: { collection: jest.fn() },
  admin: { firestore: { FieldValue: { serverTimestamp: jest.fn() } } },
}));
import { app, server } from '../src/index';

describe('GET /health', () => {
  afterAll(() => {
    server.close();
  });

  it('should return 200 and status UP', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
  });
});
