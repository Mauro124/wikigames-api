import axios from 'axios';
import { AppError } from '@shared/domain/app-error';
import { cacheService } from '@shared/services/cache.service';
import { logger } from '@shared/services/logger.service';

export interface WikiRESTResponse {
  html: string;
  resolvedTitle: string;
  etag: string;
}

interface CachedArticle {
  html: string;
  resolvedTitle: string;
  etag: string;
}

export class WikipediaService {
  /**
   * Fetches the rendered HTML of a Wikipedia article using REST API.
   * Implements ETag-based caching with If-None-Match.
   */
  async fetchArticle(lang: string, title: string): Promise<WikiRESTResponse> {
    const cacheKey = `wiki:html:${lang}:${title}`;
    const cached = cacheService.get<CachedArticle>(cacheKey);

    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
    const headers: Record<string, string> = {
      'User-Agent': 'WikiGameBackend/1.0 (contact@example.com)',
    };

    if (cached?.etag) {
      headers['If-None-Match'] = cached.etag;
    }

    try {
      const response = await axios.get(url, {
        headers,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
      });

      if (response.status === 304 && cached) {
        logger.debug(`ETag hit (304) for ${title} (${lang})`);
        return cached;
      }

      const html = response.data;
      const etag = response.headers.etag as string;
      // REST API doesn't return resolved title in body easily, we use the title from response or requested
      const resolvedTitle = title.replace(/_/g, ' ');

      const result = { html, resolvedTitle, etag };

      // Cache for 24h
      cacheService.set(cacheKey, result);

      return result;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new AppError(`Article "${title}" not found in language "${lang}"`, 404);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(`Failed to fetch article from Wikipedia REST API: ${message}`, 500);
    }
  }
}

export const wikipediaService = new WikipediaService();
