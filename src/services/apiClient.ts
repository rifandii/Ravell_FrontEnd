import axios from 'axios';
import { backendUnavailable } from '../lib/backendFailure';
import type {
  ApiArticle,
  ApiArticleListResponse,
  ApiCategory,
  ApiCategoryListResponse,
  ApiContentSignature,
  ApiTag,
  ApiTagListResponse,
} from '../types/api-contracts';
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

type ArticleResponse = ApiArticle & Article;
type CategoryResponse = ApiCategory & Category;
type TagResponse = ApiTag & Tag;
type ArticleListResponse = ApiArticleListResponse & PaginatedResponse<Article>;
type CategoryListResponse = ApiCategoryListResponse & PaginatedResponse<Category>;
type TagListResponse = ApiTagListResponse & PaginatedResponse<Tag>;

export const getPaginatedArticles = async (urlOrPath: string): Promise<PaginatedResponse<Article>> => {
  try {
    // Django pagination can return absolute next/previous URLs; use them as-is.
    if (urlOrPath.startsWith('http')) {
      const response = await apiClient.get<ArticleListResponse>(urlOrPath);
      return response.data;
    }

    const response = await apiClient.get<ArticleListResponse>(urlOrPath);
    return response.data;
  } catch {
    throw backendUnavailable();
  }
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    const response = await apiClient.get<ArticleResponse>(`/articles/${slug}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw backendUnavailable();
  }
};

export const getLatestArticles = async (): Promise<Article[]> => {
  try {
    const response = await apiClient.get<ArticleResponse[]>('/articles/latest/');
    return response.data;
  } catch {
    throw backendUnavailable();
  }
};

export const getPaginatedCategories = async (): Promise<PaginatedResponse<Category>> => {
  try {
    const response = await apiClient.get<CategoryListResponse>('/categories/');
    return response.data;
  } catch {
    throw backendUnavailable();
  }
};

export const getPaginatedTags = async (): Promise<PaginatedResponse<Tag>> => {
  try {
    const response = await apiClient.get<TagListResponse>('/tags/');
    return response.data;
  } catch {
    throw backendUnavailable();
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const response = await apiClient.get<CategoryResponse>(`/categories/${slug}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw backendUnavailable();
  }
};

export const getTagBySlug = async (slug: string): Promise<Tag | null> => {
  try {
    const response = await apiClient.get<TagResponse>(`/tags/${slug}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw backendUnavailable();
  }
};

export interface ContentSignature {
  signature: string;
}

export const getContentSignature = async (): Promise<ContentSignature> => {
  try {
    const response = await apiClient.get<ApiContentSignature & ContentSignature>('/content/signature/');
    return response.data;
  } catch {
    throw backendUnavailable();
  }
};
