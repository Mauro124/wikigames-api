export interface ArticleSpan {
  text: string;
  link?: string;
}

export interface ArticleBlock {
  type: 'paragraph' | 'header' | 'image';
  text?: string;
  url?: string;
  spans?: ArticleSpan[];
  level?: number;
}

export interface Article {
  title: string;
  resolvedTitle: string;
  lang: string;
  blocks: ArticleBlock[];
  cached: boolean;
  timestamp: string;
}
