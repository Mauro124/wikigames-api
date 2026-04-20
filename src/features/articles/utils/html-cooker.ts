import * as cheerio from 'cheerio';
import { ArticleBlock, ArticleSpan } from '../domain/article.entity';

export const cookArticle = (rawHtml: string): ArticleBlock[] => {
  const $ = cheerio.load(rawHtml);
  const blocks: ArticleBlock[] = [];

  // Wikipedia content usually resides in specific containers
  const content = $('body');

  content.find('> p, > h2, > h3, > figure').each((_, el) => {
    const node = $(el);
    const tagName = el.type === 'tag' ? el.name : '';

    if (tagName.startsWith('h')) {
      const titleText = node.text().replace(/\[edit\]/g, '').trim();
      if (titleText) {
        blocks.push({
          type: 'header',
          text: titleText,
          level: parseInt(tagName.substring(1)) || 2
        });
      }
    } 
    else if (tagName === 'p') {
      const spans: ArticleSpan[] = [];
      
      // Process children to find text and links
      node.contents().each((_, child) => {
        const childNode = $(child);
        if (child.type === 'text') {
          const text = childNode.text();
          if (text) spans.push({ text });
        } else if (child.type === 'tag' && child.name === 'a') {
          const href = childNode.attr('href');
          const linkText = childNode.text().trim();
          if (href && href.startsWith('/wiki/') && linkText) {
            spans.push({ 
              text: childNode.text(), 
              link: href.replace('/wiki/', '') 
            });
          } else {
            spans.push({ text: childNode.text() });
          }
        } else if (child.type === 'tag' && ['b', 'i', 'strong', 'em'].includes(child.name)) {
             spans.push({ text: childNode.text() });
        }
      });

      if (spans.length > 0) {
        blocks.push({ type: 'paragraph', spans });
      }
    }
    else if (tagName === 'figure') {
      const img = node.find('img');
      if (img.length > 0) {
        blocks.push({
          type: 'image',
          url: img.attr('src'),
          text: node.find('figcaption').text().trim() || undefined
        });
      }
    }
  });

  return blocks;
};
