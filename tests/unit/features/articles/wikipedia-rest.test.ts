import { wikipediaService } from '../../../../src/features/articles/data/wikipedia.service';
import { cacheService } from '../../../../src/shared/services/cache.service';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../../../src/shared/services/cache.service');

describe('WikipediaService (REST API + ETags)', () => {
  const lang = 'en';
  const title = 'Test_Article';
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${title}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and cache a new article', async () => {
    const mockHtml = '<html><body>Test</body></html>';
    const mockEtag = '"v1"';

    (axios.get as jest.Mock).mockResolvedValue({
      status: 200,
      data: mockHtml,
      headers: { etag: mockEtag },
    });

    (cacheService.get as jest.Mock).mockReturnValue(null);

    const result = await wikipediaService.fetchArticle(lang, title);

    expect(axios.get).toHaveBeenCalledWith(url, expect.objectContaining({
      headers: expect.objectContaining({ 'User-Agent': expect.any(String) })
    }));
    expect(result.html).toBe(mockHtml);
    expect(result.etag).toBe(mockEtag);
    expect(cacheService.set).toHaveBeenCalled();
  });

  it('should return cached content on 304 Not Modified', async () => {
    const cachedData = { html: 'cached', resolvedTitle: 'Test Article', etag: '"v1"' };
    (cacheService.get as jest.Mock).mockReturnValue(cachedData);

    (axios.get as jest.Mock).mockResolvedValue({
      status: 304,
    });

    const result = await wikipediaService.fetchArticle(lang, title);

    expect(axios.get).toHaveBeenCalledWith(url, expect.objectContaining({
      headers: expect.objectContaining({ 'If-None-Match': '"v1"' })
    }));
    expect(result.html).toBe('cached');
    expect(cacheService.set).not.toHaveBeenCalled();
  });

  it('should throw 404 for missing articles', async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 404 }
    });

    await expect(wikipediaService.fetchArticle(lang, title)).rejects.toThrow('not found');
  });
});
