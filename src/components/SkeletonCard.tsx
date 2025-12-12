// src/components/SkeletonCard.tsx
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonCard = () => {
  // Gunakan kelas yang sama dengan ArticleCard untuk konsistensi layout
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-transparent dark:border-gray-700">
      {/* Gambar Placeholder */}
      <Skeleton height={192} className="w-full" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
      
      <div className="p-4">
        {/* Judul Placeholder */}
        <h2 className="text-xl font-bold mb-2">
          <Skeleton width={`70%`} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
        </h2>
        {/* Metadata Placeholder */}
        <p className="text-sm mb-4">
          <Skeleton width={`50%`} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
        </p>
        {/* Ringkasan Placeholder (Dua baris) */}
        <p className="text-sm">
          <Skeleton count={2} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
        </p>
      </div>
    </div>
  );
};

export default SkeletonCard;