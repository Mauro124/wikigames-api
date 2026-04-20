import { AppError } from '@shared/domain/app-error';

describe('AppError', () => {
  it('should create an operational error with status code', () => {
    const error = new AppError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('should create a non-operational error when specified', () => {
    const error = new AppError('System crash', 500, false);
    expect(error.isOperational).toBe(false);
  });
});
