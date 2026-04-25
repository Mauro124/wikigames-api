import request from 'supertest';
import { app } from '../../src/index';

describe('Internal Routes Integration', () => {
  const generatorKey = 'super-secret-key-123';

  describe('GET /internal/ping', () => {
    it('should return 200', async () => {
      const response = await request(app)
        .get('/internal/ping')
        .set('X-GENERATOR-KEY', generatorKey);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Internal router reached');
    });
  });

  describe('POST /internal/challenges/generate/today', () => {
    it('should be reachable and not return 404', async () => {
      const response = await request(app)
        .post('/internal/challenges/generate/today')
        .set('X-GENERATOR-KEY', generatorKey)
        .send({ lang: 'en' });

      expect(response.status).not.toBe(404);
    });

    it('should return 404 for GET method', async () => {
      const response = await request(app)
        .get('/internal/challenges/generate/today');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /internal/challenges/generate', () => {
    it('should be reachable and not return 404', async () => {
      const response = await request(app)
        .post('/internal/challenges/generate')
        .set('X-GENERATOR-KEY', generatorKey)
        .send({ startDate: '2026-05-01', lang: 'en' });

      expect(response.status).not.toBe(404);
    });
  });
});
