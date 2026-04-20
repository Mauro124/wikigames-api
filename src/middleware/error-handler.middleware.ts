import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/services/logger.service';

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    msg: message,
    err,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

export { errorHandler };
