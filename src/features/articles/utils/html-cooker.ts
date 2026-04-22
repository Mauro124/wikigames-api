import * as cheerio from 'cheerio';
import { ArticleBlock, ArticleSpan } from '../domain/article.entity';

export class ArticleCooker {
  /**
   * Transforms raw Wikipedia HTML into a structured list of ArticleBlocks.
   */
  cook(html: string): ArticleBlock[] {
    const $ = cheerio.load(html);
    // Try different selectors as Wikipedia structure can vary by language or parsing mode
    let content = $('#mw-content-text .mw-parser-output');
    if (content.length === 0) {
      content = $('.mw-parser-output');
    }
    if (content.length === 0) {
      content = $('#mw-content-text');
    }

    const blocks: ArticleBlock[] = [];

    // Cast to any to bypass strict Cheerio Element/Document this-context mismatch in TypeScript
    const searchTarget: any = content.length > 0 ? content : $.root();

    searchTarget.find('h1, h2, h3, p').each((_: number, el: any) => {
      const $el = $(el);
      const tagName = el.name.toLowerCase();

      if (['h1', 'h2', 'h3'].includes(tagName)) {
        const text = $el
          .text()
          .replace(/\[edit\]/g, '')
          .trim();
        if (text) {
          blocks.push({
            type: 'header',
            text,
            level: parseInt(tagName.substring(1), 10),
          });
        }
      } else if (tagName === 'p') {
        const spans = this.parseParagraph($el, $);
        if (spans.length > 0) {
          blocks.push({
            type: 'paragraph',
            spans,
          });
        }
      }
    });

    return blocks;
  }

  /**
   * Parses a paragraph element into ArticleSpans, identifying and rewriting internal links.
   */
  private parseParagraph($p: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): ArticleSpan[] {
    const spans: ArticleSpan[] = [];

    $p.contents().each((_, node) => {
      if (node.type === 'text') {
        const text = $(node).text();
        if (text) {
          spans.push({ text });
        }
      } else if (node.type === 'tag' && (node as any).name === 'a') {
        const $a = $(node);
        const href = $a.attr('href');
        const text = $a.text();

        // Wikipedia internal links follow the pattern /wiki/Page_Title or ./Page_Title (REST API)
        // We exclude special namespaces (File:, Category:, etc.) by checking for colons
        if (href && !href.includes(':')) {
          let title = '';
          if (href.startsWith('/wiki/')) title = href.replace('/wiki/', '');
          else if (href.startsWith('./')) title = href.replace('./', '');

          if (title) {
            spans.push({
              text,
              link: decodeURIComponent(title),
            });
          } else if (text) {
            spans.push({ text });
          }
        } else if (text) {
          spans.push({ text });
        }
      }
    });

    return this.mergeConsecutiveTextSpans(spans);
  }

  /**
   * Clean up spans by merging consecutive plain text segments.
   */
  private mergeConsecutiveTextSpans(spans: ArticleSpan[]): ArticleSpan[] {
    if (spans.length === 0) return [];

    const merged: ArticleSpan[] = [];
    let current = spans[0];

    for (let i = 1; i < spans.length; i++) {
      const next = spans[i];
      if (!current.link && !next.link) {
        current.text += next.text;
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    return merged.filter((s) => s.text.trim() !== '' || s.link);
  }
}

export const articleCooker = new ArticleCooker();
