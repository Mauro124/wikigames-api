import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/domain/app-error';

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isOperational = err instanceof AppError ? err.isOperational : false;

  req.log.error({
    msg: message,
    err: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    },
    isOperational,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    isOperational,
  });
};

export { errorHandler };
