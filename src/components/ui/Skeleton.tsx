interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export default function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-neutral-200";

  const variantClasses = {
    text: "rounded h-4 w-full",
    circular: "rounded-full w-10 h-10",
    rectangular: "rounded-lg w-full h-20",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}
