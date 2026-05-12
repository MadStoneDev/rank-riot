import { clsx } from "clsx";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function GlassCard({
  children,
  className,
  elevated = false,
  interactive = false,
  padding = "md",
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        elevated ? "glass-card-elevated" : "glass-card",
        interactive && "surface-interactive cursor-pointer",
        PADDING[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  children,
  className,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--color-border-subtle)]",
        className,
      )}
    >
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}
