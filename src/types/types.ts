// src/types/types.ts

// Interface untuk Navigasi Kontekstual (Previous/Next Article)
export interface NavArticle {
  title: string;
  slug: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  markdown_content: string;
  published_date: string;
  updated_date: string;
  is_published: boolean;
  author_username: string;
  categories: Category[];
  tags: Tag[];
  featured_image_url: string | null;
  // Tambahkan field baru di sini
  previous_article: NavArticle | null;
  next_article: NavArticle | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count?: number;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

export interface Heading {
  id: string;
  text: string | null;
  level: string;
}

export interface ArticleQueryParams {
  categories__slug?: string;
  tags__slug?: string;
  search?: string;
  year?: string;
  month?: string;
}