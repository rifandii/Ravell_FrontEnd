import axios from 'axios';
import type { Article, Category, Tag } from '../types/types';

// Shared browser-side API client. Next server components use native fetch so
// ISR/revalidation metadata stays attached to each server-rendered request.
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_API_BASE_URL || 'https://api.ravell.tech')
  : (typeof process !== 'undefined' && process.env ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech') : 'https://api.ravell.tech');
const API_BASE_URL = `${BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // Keep slow backend responses bounded for client-side views.
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getPaginatedArticles = async (urlOrPath: string): Promise<PaginatedResponse<Article>> => {
  try {
    // Django pagination can return absolute next/previous URLs; use them as-is.
    if (urlOrPath.startsWith('http')) {
      const response = await axios.get(urlOrPath);
      return response.data;
    }

    const response = await apiClient.get(urlOrPath);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated articles:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    const response = await apiClient.get(`/articles/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return null;
  }
};

export const getLatestArticles = async (): Promise<Article[]> => {
  try {
    const response = await apiClient.get('/articles/latest/');
    return response.data;
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
};

export const getPaginatedCategories = async (): Promise<PaginatedResponse<Category>> => {
  try {
    const response = await apiClient.get('/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const getPaginatedTags = async (): Promise<PaginatedResponse<Tag>> => {
  try {
    const response = await apiClient.get('/tags/');
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const response = await apiClient.get(`/categories/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }
};

export const getTagBySlug = async (slug: string): Promise<Tag | null> => {
  try {
    const response = await apiClient.get(`/tags/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tag with slug ${slug}:`, error);
    return null;
  }
};

export interface ContentSignature {
  signature: string;
}

export const getContentSignature = async (): Promise<ContentSignature> => {
  try {
    const response = await apiClient.get<ContentSignature>('/content/signature/');
    return response.data;
  } catch (error) {
    console.error('Error fetching content signature:', error);
    return { signature: '' };
  }
};
