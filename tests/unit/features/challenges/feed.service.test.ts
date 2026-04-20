import nock from 'nock';
import { wikipediaFeedService } from '../../../../src/features/challenges/data/wikipedia-feed.service';

describe('WikipediaFeedService', () => {
  const lang = 'en';
  const baseUrl = `https://${lang}.wikipedia.org`;

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch category members', async () => {
    nock(baseUrl)
      .get('/w/api.php')
      .query(true)
      .reply(200, {
        query: {
          categorymembers: [{ title: 'Article 1' }, { title: 'Article 2' }],
        },
      });

    const members = await wikipediaFeedService.getRandomArticlesFromCategory(lang, 'Science');
    expect(members).toHaveLength(2);
    expect(members).toContain('Article 1');
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

    const links = await wikipediaFeedService.getLinksForPage(lang, 'Earth');
    expect(links).toHaveLength(2);
    expect(links).toContain('Link 1');
  });
});
