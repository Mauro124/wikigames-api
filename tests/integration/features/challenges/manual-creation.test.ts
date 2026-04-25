import request from 'supertest';
import { app, server } from '../../../../src/index';
import { CreateManualChallengeUseCase } from '../../../../src/features/challenges/domain/create-manual-challenge.usecase';

jest.mock('../../../../src/features/challenges/domain/create-manual-challenge.usecase');

describe('POST /internal/challenges (Manual Creation)', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GENERATOR_API_KEY = 'test-key';
  });

  it('should create a manual challenge successfully', async () => {
    const mockPayload = {
      id: '2026-05-01',
      lang: 'en',
      targetTitle: 'Quantum Mechanics',
      challenges: [{ startTitle: 'Albert Einstein', endTitle: 'Quantum Mechanics' }],
    };

    const mockResponse = {
      id: '2026-05-01',
      targetTitle: 'Quantum Mechanics',
      challenges: [{ minClicks: 2, difficulty: 'Easy' }],
    };

    (CreateManualChallengeUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResponse);

    const response = await request(app)
      .post('/internal/challenges')
      .set('x-generator-key', 'test-key')
      .send(mockPayload);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.id).toBe(mockPayload.id);
  });

  it('should return 400 if no path is found', async () => {
    const mockPayload = {
      id: '2026-05-01',
      lang: 'en',
      targetTitle: 'B',
      challenges: [{ startTitle: 'A', endTitle: 'B' }],
    };

    (CreateManualChallengeUseCase.prototype.execute as jest.Mock).mockRejectedValue({
      message: 'No path found',
      statusCode: 400,
      isOperational: true,
    });

    const response = await request(app)
      .post('/internal/challenges')
      .set('x-generator-key', 'test-key')
      .send(mockPayload);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('No path found');
  });

  it('should return 401 if unauthorized', async () => {
    const response = await request(app).post('/internal/challenges').send({});

    expect(response.status).toBe(401);
  });
});
