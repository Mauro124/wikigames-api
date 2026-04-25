import { Article } from './article.entity';
import { wikipediaService } from '../data/wikipedia.service';
import { articleCooker } from '../utils/html-cooker';

export class GetArticleUseCase {
  async execute(lang: string, title: string): Promise<Article> {
    const { html, resolvedTitle, cached } = await wikipediaService.fetchArticle(lang, title);
    const blocks = articleCooker.cook(html);

    return {
      title,
      resolvedTitle,
      lang,
      blocks,
      cached,
      timestamp: new Date().toISOString(),
    };
  }
}

export const getArticleUseCase = new GetArticleUseCase();
