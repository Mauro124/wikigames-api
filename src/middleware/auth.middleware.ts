import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-generator-key'];
  const expectedKey = process.env.GENERATOR_API_KEY;

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or missing X-GENERATOR-KEY',
    });
  }

  next();
};
