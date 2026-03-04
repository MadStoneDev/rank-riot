import Skeleton from "@/components/ui/Skeleton";
import SkeletonCard from "@/components/ui/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton variant="rectangular" className="!w-32 !h-10 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="divide-y divide-neutral-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-4 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="divide-y divide-neutral-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-4 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
