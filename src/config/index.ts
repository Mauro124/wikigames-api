import dotenv from 'dotenv';
import { logger } from '@shared/services/logger.service';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  wikipedia: {
    userAgent: process.env.WIKI_USER_AGENT || 'TheWikiGame/1.0 (admin@thewikigame.fun)',
  },
};

// Simple validation
if (isNaN(config.port)) {
  logger.error('Config error: PORT must be a number');
  process.exit(1);
}

export { config };
