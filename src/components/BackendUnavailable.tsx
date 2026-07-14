import { AlertCircle } from 'lucide-react';

export default function BackendUnavailable() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-bold text-gray-900 dark:text-white">Content Temporarily Unavailable</h1>
      <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
        The content service is temporarily unavailable. Please try again shortly.
      </p>
    </section>
  );
}
