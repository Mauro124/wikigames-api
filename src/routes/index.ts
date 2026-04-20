import { Router } from 'express';
import { healthRouter } from '@routes/health.routes';
import { articleRouter } from '@features/articles/article.routes';
import { internalRouter } from '@routes/internal.routes';
import { resultRouter } from './result.routes';
import { statsRouter } from './stats.routes';
import categoryRouter from './category.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/articles', articleRouter);
router.use('/internal', internalRouter);
router.use('/results', resultRouter);
router.use('/challenges', statsRouter);
router.use('/categories', categoryRouter);

export { router };
