// src/services/apiClient.ts
import axios from 'axios';
import type { Article, Category, Tag } from '../types/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ravell.tech';
const API_BASE_URL = `${BASE_URL}/api`;

// [PERBAIKAN 1] Membuat Axios Instance
// Ini memungkinkan kita mengatur konfigurasi global satu kali saja.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // [PENTING] 20 detik timeout untuk mengantisipasi "Cold Start" Railway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Antarmuka respons paginasi
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Fungsi fetching artikel dengan paginasi
export const getPaginatedArticles = async (urlOrPath: string): Promise<PaginatedResponse<Article>> => {
  try {
    // [PERBAIKAN 2] Logika Cerdas URL
    // Cek apakah input adalah URL lengkap (http...) atau path relatif (/articles...)
    // Django REST Framework sering mengembalikan 'next' sebagai URL lengkap.
    if (urlOrPath.startsWith('http')) {
       // Jika URL lengkap, gunakan axios biasa (bypass baseURL instance)
       const response = await axios.get(urlOrPath);
       return response.data;
    }
    
    // Jika path relatif, gunakan apiClient (otomatis pasang API_BASE_URL)
    const response = await apiClient.get(urlOrPath);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated articles:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    // Gunakan apiClient, tidak perlu tulis ${API_BASE_URL} lagi
    const response = await apiClient.get(`/articles/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return null;
  }
};

export const getLatestArticles = async (): Promise<Article[]> => {
  try {
    const response = await apiClient.get(`/articles/latest/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
};

export const getPaginatedCategories = async (): Promise<PaginatedResponse<Category>> => {
  try {
    const response = await apiClient.get(`/categories/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const getPaginatedTags = async (): Promise<PaginatedResponse<Tag>> => {
  try {
    const response = await apiClient.get(`/tags/`);
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
    const response = await apiClient.get<ContentSignature>(`/content/signature/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching content signature:', error);
    return { signature: '' };
  }
};