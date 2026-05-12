import { clsx } from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={clsx("glass-card p-4 flex items-start gap-3", className)}>
      {icon && (
        <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--color-primary-muted)]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--color-text-muted)] truncate">{label}</p>
        <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={clsx(
                "text-xs font-medium",
                trend.value > 0
                  ? "text-[var(--color-score-good)]"
                  : trend.value < 0
                    ? "text-[var(--color-score-critical)]"
                    : "text-[var(--color-text-muted)]",
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
