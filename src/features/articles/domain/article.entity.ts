export interface ArticleSpan {
  text: string;
  link?: string; // Si existe, es un título de Wikipedia
}

export interface ArticleBlock {
  type: 'paragraph' | 'header' | 'image';
  text?: string; // Para headers
  url?: string; // Para imágenes
  spans?: ArticleSpan[]; // Para párrafos (texto con links incrustados)
  level?: number; // Para headers (1, 2, 3)
}

export interface Article {
  title: string;
  resolvedTitle: string;
  lang: string;
  blocks: ArticleBlock[];
  cached: boolean;
  timestamp: string;
}
