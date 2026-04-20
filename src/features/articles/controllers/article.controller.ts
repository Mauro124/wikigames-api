import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import { getArticleUseCase } from '../domain/get-article.usecase';
import { logger } from '@shared/services/logger.service';

// Cache TTL: 1 hour (3600 seconds)
const articleCache = new NodeCache({ stdTTL: 3600 });

export class ArticleController {
  async getArticle(req: Request, res: Response): Promise<void> {
    const { lang, title } = req.params;
    const cacheKey = `${lang}:${title}`;

    const cachedArticle = articleCache.get(cacheKey);
    if (cachedArticle) {
      logger.debug(`Cache hit for article: ${cacheKey}`);
      res.json({ ...(cachedArticle as object), cached: true });
      return;
    }

    const article = await getArticleUseCase.execute(lang, title);
    articleCache.set(cacheKey, article);

    res.json(article);
  }
}

export const articleController = new ArticleController();
