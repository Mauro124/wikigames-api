import request from 'supertest';
import { app, server } from '../../../../src/index';

jest.mock('../../../../src/features/results/domain/submit-result.usecase', () => ({
  submitResultUseCase: {
    execute: jest.fn(),
  },
}));

import { submitResultUseCase } from '../../../../src/features/results/domain/submit-result.usecase';

describe('POST /results/surrender', () => {
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
    (submitResultUseCase.execute as jest.Mock).mockResolvedValue({
      success: true,
    });

    const response = await request(app).post('/results/surrender').send({
      challengeId: '2024-06-01_0',
      userId: 'test_user',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // Check if payload injected dummy values and isSurrender
    expect(submitResultUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeId: '2024-06-01_0',
        userId: 'test_user',
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
