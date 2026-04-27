import 'module-alias/register';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '@config/index';
import { logger, httpLogger } from '@shared/services/logger.service';
import { router } from '@routes/index';
import { errorHandler } from '@middleware/error-handler.middleware';
import { AppError } from '@shared/domain/app-error';
import { onRequest } from 'firebase-functions/v2/https';

const app = express();

app.use(helmet());
// app.use(
//   cors({
//     origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
//     credentials: true,
//   }),
// );
app.use(express.json());
app.use(httpLogger);
app.use(router);

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

let server: any;

if (
  !process.env.FUNCTIONS_EMULATOR &&
  !process.env.FIREBASE_CONFIG &&
  process.env.NODE_ENV !== 'production'
) {
  server = app.listen(config.port, () => {
    logger.info(`WikiGames Backend running in ${config.env} mode on port ${config.port}`);
  });
}

export const api = onRequest({ memory: '256MiB', timeoutSeconds: 60, region: 'us-central1' }, app);

export { app, server };
