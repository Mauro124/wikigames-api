import axios from 'axios';
import { logger } from '@shared/services/logger.service';

export interface WikiFeedResponse {
  tfa?: { title: string };
  mostread?: { articles: Array<{ article: string }> };
}

export class WikipediaFeedService {
  async fetchFeed(datePath: string): Promise<WikiFeedResponse> {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/featured/${datePath}`;

    try {
      const response = await axios.get<WikiFeedResponse>(url, {
        headers: {
          'User-Agent': 'WikiGamesGenerator/1.0',
        },
      });
      return response.data;
    } catch (error: any) {
      logger.error({ msg: 'Wikipedia Feed Fetch Error', error: error.message, url });
      throw error;
    }
  }
}

export const wikipediaFeedService = new WikipediaFeedService();
