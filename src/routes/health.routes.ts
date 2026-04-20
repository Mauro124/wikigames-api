import { Router, Request, Response } from 'express';
import { config } from '@config/index';

const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    env: config.env,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export { healthRouter };
