import Skeleton from "@/components/ui/Skeleton";
import SkeletonCard from "@/components/ui/SkeletonCard";

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton variant="rectangular" className="!w-28 !h-10 rounded-lg" />
          <Skeleton variant="rectangular" className="!w-24 !h-10 rounded-lg" />
          <Skeleton variant="rectangular" className="!w-24 !h-10 rounded-lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Section skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Skeleton variant="rectangular" className="!w-10 !h-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton variant="rectangular" className="!h-48" />
              <Skeleton variant="rectangular" className="!h-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
