import { clsx } from "clsx";

type BadgeVariant =
  | "good"
  | "warning"
  | "critical"
  | "neutral"
  | "info"
  | "severity-critical"
  | "severity-high"
  | "severity-medium"
  | "severity-low";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  good: "bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] border-[var(--color-score-good)]/20",
  warning: "bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)] border-[var(--color-score-warning)]/20",
  critical: "bg-[var(--color-score-critical-muted)] text-[var(--color-score-critical)] border-[var(--color-score-critical)]/20",
  neutral: "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]",
  info: "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border-[var(--color-primary)]/20",
  "severity-critical": "bg-[var(--color-severity-critical)]/10 text-[var(--color-severity-critical)] border-[var(--color-severity-critical)]/20",
  "severity-high": "bg-[var(--color-severity-high)]/10 text-[var(--color-severity-high)] border-[var(--color-severity-high)]/20",
  "severity-medium": "bg-[var(--color-severity-medium)]/10 text-[var(--color-severity-medium)] border-[var(--color-severity-medium)]/20",
  "severity-low": "bg-[var(--color-severity-low)]/10 text-[var(--color-severity-low)] border-[var(--color-severity-low)]/20",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 border rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({
  severity,
  count,
  className,
}: {
  severity: "critical" | "high" | "medium" | "low";
  count: number;
  className?: string;
}) {
  if (count === 0) return null;
  const variant = `severity-${severity}` as BadgeVariant;
  return (
    <Badge variant={variant} className={className}>
      {count} {severity}
    </Badge>
  );
}
