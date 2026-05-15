import axios from 'axios';
import { AppError } from '@shared/domain/app-error';
import { cacheService } from '@shared/services/cache.service';
import { logger } from '@shared/services/logger.service';
import { config } from '@config/index';

export interface WikiRESTResponse {
  html: string;
  resolvedTitle: string;
  etag: string;
  cached: boolean;
}

interface CachedArticle {
  html: string;
  resolvedTitle: string;
  etag: string;
}

export class WikipediaService {
  private readonly maxRetries = 4;
  private readonly initialDelay = 1500;

  /**
   * Fetches the rendered HTML of a Wikipedia article using REST API.
   * Implements ETag-based caching with If-None-Match.
   */
  async fetchArticle(lang: string, title: string): Promise<WikiRESTResponse> {
    const cacheKey = `wiki:html:${lang}:${title}`;
    const cached = cacheService.get<CachedArticle>(cacheKey);

    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
    const headers: Record<string, string> = {
      'User-Agent': config.wikipedia.userAgent,
    };

    if (cached?.etag) {
      headers['If-None-Match'] = cached.etag;
    }

    let lastError: any;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          headers,
          validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
        });

        if (response.status === 304 && cached) {
          logger.debug(`ETag hit (304) for ${title} (${lang})`);
          return { ...cached, cached: true };
        }

        const html = response.data;
        const etag = response.headers.etag as string;
        const resolvedTitle = title.replace(/_/g, ' ');

        const result = { html, resolvedTitle, etag };

        // Cache for 24h
        cacheService.set(cacheKey, result);

        return { ...result, cached: false };
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;

        if (status === 404) {
          throw new AppError(`Article "${title}" not found in language "${lang}"`, 404);
        }

        if (status === 429 && attempt < this.maxRetries) {
          const delay = this.initialDelay * Math.pow(2, attempt);
          logger.warn(`Wikipedia 429. Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        break;
      }
    }

    const status = lastError.response?.status || 500;
    const message = lastError.response?.data?.message || lastError.message || 'Unknown error';

    if (status === 429) {
      throw new AppError('Wikipedia is currently rate limiting requests. Please try again later.', 429);
    }

    throw new AppError(`Failed to fetch article from Wikipedia REST API: ${message}`, status);
  }
}
