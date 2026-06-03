import { Loader2 } from 'lucide-react';

// Full page loading spinner
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" />
      <p className="mt-3 text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

// Skeleton loader for cards
export const CardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
);

export default PageLoader;