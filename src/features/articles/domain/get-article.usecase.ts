import { Article } from './article.entity';
import { wikipediaService } from '../data/wikipedia.service';
import { cacheService } from '@shared/services/cache.service';
import { cookArticle } from '../utils/html-cooker';
import { logger } from '@shared/services/logger.service';

export class GetArticleUseCase {
  async execute(lang: string, title: string): Promise<Article> {
    const cacheKey = `article:v3:${lang}:${title}`;
    const cachedArticle = cacheService.get<Article>(cacheKey);

    if (cachedArticle) {
      return { ...cachedArticle, cached: true };
    }

    const { html, resolvedTitle } = await wikipediaService.fetchArticle(lang, title);
    const blocks = cookArticle(html);

    const article: Article = {
      title,
      resolvedTitle,
      lang,
      blocks,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    cacheService.set(cacheKey, article);
    return article;
  }
}

export const getArticleUseCase = new GetArticleUseCase();
