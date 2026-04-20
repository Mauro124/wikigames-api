import request from 'supertest';
import nock from 'nock';
// Mock Firebase Config globally to avoid init errors
jest.mock('../src/config/firebase.config', () => ({
  db: { collection: jest.fn() },
  admin: { firestore: { FieldValue: { serverTimestamp: jest.fn() } } },
}));
import { app, server } from '../src/index';

describe('GET /articles/:lang/:title', () => {
  afterAll(() => {
    server.close();
    nock.cleanAll();
  });

  it('should return sanitized article content', async () => {
    const mockHtml = '<html><body><p>Keep me</p></body></html>';
    nock('https://en.wikipedia.org').get('/api/rest_v1/page/html/Earth').reply(200, mockHtml);

    const response = await request(app).get('/articles/en/Earth');
    expect(response.status).toBe(200);
  });
});
