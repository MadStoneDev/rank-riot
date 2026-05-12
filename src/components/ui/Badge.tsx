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
  "severity-critical": "bg-[#f43f5e20] text-[#f43f5e] border-[#f43f5e]/20",
  "severity-high": "bg-[#f9731620] text-[#f97316] border-[#f97316]/20",
  "severity-medium": "bg-[#f59e0b20] text-[#f59e0b] border-[#f59e0b]/20",
  "severity-low": "bg-[#6b728020] text-[#9ca3af] border-[#6b7280]/20",
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
