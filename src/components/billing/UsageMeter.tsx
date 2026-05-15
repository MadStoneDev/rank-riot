"use client";

interface UsageMeterProps {
  current: number;
  max: number | "unlimited";
  label: string;
  unit?: string;
}

export default function UsageMeter({
  current,
  max,
  label,
  unit = "",
}: UsageMeterProps) {
  const isUnlimited = max === "unlimited";
  const percentage = isUnlimited ? 0 : Math.min(100, (current / (max as number)) * 100);

  // Color based on usage percentage
  let barColor = "bg-[var(--color-score-good)]";
  if (!isUnlimited) {
    if (percentage >= 90) barColor = "bg-[var(--color-score-critical)]";
    else if (percentage >= 75) barColor = "bg-[var(--color-score-warning)]";
    else if (percentage >= 50) barColor = "bg-[var(--color-score-warning)]";
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-[var(--color-text-muted)]">
          {current.toLocaleString()}
          {unit && ` ${unit}`}
          {" / "}
          {isUnlimited ? "Unlimited" : (max as number).toLocaleString()}
          {unit && !isUnlimited && ` ${unit}`}
        </span>
      </div>
      <div className="h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: isUnlimited ? "0%" : `${percentage}%` }}
        />
      </div>
      {!isUnlimited && percentage >= 90 && (
        <p className="text-xs text-[var(--color-score-critical)]">
          Approaching limit - consider upgrading your plan
        </p>
      )}
    </div>
  );
}
