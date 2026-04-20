import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '@config/index';
import { logger, httpLogger } from '@shared/services/logger.service';
import { router } from '@routes/index';
import { errorHandler } from '@middleware/error-handler.middleware';
import { AppError } from '@shared/domain/app-error';

const app = express();

// Security and JSON parsing
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true,
  }),
);
app.use(express.json());

// Structured Logging (pino-http)
app.use(httpLogger);

// Main Router
app.use(router);

// Catch-all 404
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global Error Handler (MUST be last)
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`WikiGames Backend running in ${config.env} mode on port ${config.port}`);
});

export { app, server };
