import request from 'supertest';
import { app, server } from '../../../../src/index';
import { generateChallengeUseCase } from '../../../../src/features/challenges/domain/generate-challenge.usecase';

jest.mock('../../../../src/features/challenges/domain/generate-challenge.usecase');

describe('Internal Challenge Generation API', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it('should trigger monthly generation in background', async () => {
    (generateChallengeUseCase.generateMonthlyBatch as jest.Mock).mockResolvedValue(300);

    const response = await request(app)
      .post('/internal/challenges/generate')
      .set('x-generator-key', process.env.GENERATOR_API_KEY || '')
      .send({ startDate: '2024-06-01' });

    expect(response.status).toBe(202);
    expect(response.body.message).toContain('background');
    expect(response.body.startDate).toBe('2024-06-01');
  });

  it('should return 400 for invalid date', async () => {
    const response = await request(app)
      .post('/internal/challenges/generate')
      .set('x-generator-key', process.env.GENERATOR_API_KEY || '')
      .send({ startDate: 'invalid-date' });

    expect(response.status).toBe(400);
  });
});
