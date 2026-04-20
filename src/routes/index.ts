import { Router } from 'express';
import { healthRouter } from '@routes/health.routes';
import { articleRouter } from '@features/articles/article.routes';
import { internalRouter } from '@routes/internal.routes';
import { resultRouter } from './result.routes';
import { statsRouter } from './stats.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/articles', articleRouter);
router.use('/internal', internalRouter);
router.use('/results', resultRouter);
router.use('/challenges', statsRouter); // Mount as /challenges/:id/stats via statsRouter

export { router };
