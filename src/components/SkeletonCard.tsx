interface SkeletonCardProps {
  showThumbnail?: boolean;
}

const SkeletonCard = ({ showThumbnail = true }: SkeletonCardProps) => {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {showThumbnail && (
        <div className="aspect-[16/9] animate-pulse border-b border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800" />
      )}

      <div className="flex min-h-[260px] flex-col p-4 sm:p-6">
        <div className="mb-4 flex gap-3">
          <div className="h-3 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="mb-4 space-y-2">
          <div className="h-5 w-4/5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-2/3 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-11/12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800/50">
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
            <div className="h-6 w-14 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-4 w-10 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
