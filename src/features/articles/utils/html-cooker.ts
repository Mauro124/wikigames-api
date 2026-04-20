import * as cheerio from 'cheerio';
import { ArticleBlock, ArticleSpan } from '../domain/article.entity';

export class ArticleCooker {
  /**
   * Transforms raw Wikipedia HTML into a structured list of ArticleBlocks.
   */
  cook(html: string): ArticleBlock[] {
    const $ = cheerio.load(html);
    const content = $('#mw-content-text .mw-parser-output');
    const blocks: ArticleBlock[] = [];

    // If the expected structure is missing, try a broader search within the content text
    const target = content.length > 0 ? content : $('#mw-content-text');

    target.children().each((_, el) => {
      const $el = $(el);
      const tagName = el.tagName.toLowerCase();

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
      } else if (node.type === 'tag' && node.tagName === 'a') {
        const $a = $(node);
        const href = $a.attr('href');
        const text = $a.text();

        // Wikipedia internal links follow the pattern /wiki/Page_Title
        // We exclude special namespaces (File:, Category:, etc.) by checking for colons
        if (href && href.startsWith('/wiki/') && !href.includes(':')) {
          const title = href.replace('/wiki/', '');
          spans.push({
            text,
            link: decodeURIComponent(title),
          });
        } else {
          // Keep the text of other links (external, special) but remove the link functionality
          if (text) {
            spans.push({ text });
          }
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
