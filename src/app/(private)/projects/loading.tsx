import Skeleton from "@/components/ui/Skeleton";
import SkeletonCard from "@/components/ui/SkeletonCard";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton variant="rectangular" className="!w-36 !h-10 rounded-lg" />
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
    </div>
  );
}
