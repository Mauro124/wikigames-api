import axios from 'axios';
import { logger } from '@shared/services/logger.service';

export class WikipediaService {
  async fetchArticle(
    lang: string,
    title: string,
  ): Promise<{ html: string; resolvedTitle: string }> {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;

    try {
      const response = await axios.get(url, {
        maxRedirects: 5,
        headers: {
          'User-Agent': 'WikiGamesProxy/1.0 (https://github.com/mauro124/wikigame-project)',
        },
      });

      // Simple way to get the resolved title from URL if redirected
      const resolvedTitle = response.request.path.split('/').pop() || title;

      return {
        html: response.data,
        resolvedTitle: decodeURIComponent(resolvedTitle),
      };
    } catch (error: any) {
      logger.error({ msg: 'Wikipedia Fetch Error', error: error.message, url });
      throw error;
    }
  }
}

export const wikipediaService = new WikipediaService();
