import { Suspense } from 'react';
import type { Metadata } from 'next';
import ArticleListClient from './ArticleListClient';

export const metadata: Metadata = {
  title: 'Articles | Ravell Tech',
  description: 'Browse our collection of articles, guides, and tutorials on networking and security.',
};

export default function ArticleListPage() {
  return (
    <Suspense fallback={
      <div className="w-full px-4 md:px-8 py-8 text-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto animate-pulse"></div>
      </div>
    }>
      <ArticleListClient />
    </Suspense>
  );
}
