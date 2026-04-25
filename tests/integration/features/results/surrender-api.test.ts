import request from 'supertest';
import { app, server } from '../../../../src/index';

import { SubmitResultUseCase } from '../../../../src/features/results/domain/submit-result.usecase';

jest.mock('../../../../src/features/results/domain/submit-result.usecase');

describe('POST /results/surrender', () => {
  const mockExecute = jest.fn();

  beforeAll(() => {
    (SubmitResultUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
  });
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

  it('should process surrender and return 201', async () => {
    mockExecute.mockResolvedValue({
      success: true,
    });

    const response = await request(app).post('/results/surrender').send({
      challengeId: '2024-06-01_0',
      userId: 'test_user',
      lang: 'en',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // Check if payload injected dummy values and isSurrender
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeId: '2024-06-01_0',
        userId: 'test_user',
        lang: 'en',
        clicks: 9999,
        timeSeconds: 9999,
        path: [],
        isSurrender: true,
      }),
    );
  });

  it('should return 400 if validation fails', async () => {
    const response = await request(app).post('/results/surrender').send({
      challengeId: '2024-06-01_0',
      // missing userId
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
  });
});
