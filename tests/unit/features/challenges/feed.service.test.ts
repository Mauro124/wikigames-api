import nock from 'nock';
import { WikipediaFeedService } from '../../../../src/features/challenges/data/wikipedia-feed.service';

describe('WikipediaFeedService', () => {
  let service: WikipediaFeedService;
  const lang = 'en';
  const baseUrl = `https://${lang}.wikipedia.org`;

  beforeEach(() => {
    service = new WikipediaFeedService();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch links for a page', async () => {
    nock(baseUrl)
      .get('/w/api.php')
      .query(true)
      .reply(200, {
        query: {
          pages: {
            '123': {
              links: [{ title: 'Link 1' }, { title: 'Link 2' }],
            },
          },
        },
      });

    const links = await service.getLinksForPage(lang, 'Earth');
    expect(links).toHaveLength(2);
    expect(links).toContain('Link 1');
  });
});
