import Skeleton from "./Skeleton";

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export default function SkeletonCard({ lines = 3, className = "" }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton variant="rectangular" className="!w-12 !h-12 rounded-xl" />
      </div>
      {lines > 3 && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: lines - 3 }).map((_, i) => (
            <Skeleton key={i} className={`h-3`} width={`${80 - i * 10}%`} />
          ))}
        </div>
      )}
    </div>
  );
}
