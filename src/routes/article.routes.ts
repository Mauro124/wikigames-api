import { Router } from 'express';
import { ArticleController } from '@features/articles/controllers/article.controller';
import { GetArticleUseCase } from '@features/articles/domain/get-article.usecase';
import { WikipediaService } from '@features/articles/data/wikipedia.service';
import { ArticleCooker } from '@features/articles/utils/html-cooker';

const router = Router();

router.get('/:lang/:title', (req, res, next) => {
  const wikipediaService = new WikipediaService();
  const articleCooker = new ArticleCooker();
  const getArticleUseCase = new GetArticleUseCase(wikipediaService, articleCooker);
  const controller = new ArticleController(getArticleUseCase);
  return controller.getArticle(req, res, next);
});

export { router as articleRouter };
