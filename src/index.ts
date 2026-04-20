import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '@config/index';
import { logger } from '@shared/services/logger.service';
import { router } from '@routes/index';
import { errorHandler } from '@middleware/error-handler.middleware';

const app = express();

// Security and JSON parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Main Router
app.use(router);

// Global Error Handler
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`WikiGames Backend running in ${config.env} mode on port ${config.port}`);
});

export { app, server };
