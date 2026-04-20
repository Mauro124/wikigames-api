import request from 'supertest';
import { app, server } from '../../../src/index';

describe('Server Infrastructure', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should have security headers (Helmet)', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
  });

  it('should handle async errors with global handler', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
  });
});
