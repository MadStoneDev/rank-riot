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
  let barColor = "bg-green-500";
  if (!isUnlimited) {
    if (percentage >= 90) barColor = "bg-red-500";
    else if (percentage >= 75) barColor = "bg-orange-500";
    else if (percentage >= 50) barColor = "bg-yellow-500";
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-neutral-700">{label}</span>
        <span className="text-neutral-500">
          {current.toLocaleString()}
          {unit && ` ${unit}`}
          {" / "}
          {isUnlimited ? "Unlimited" : (max as number).toLocaleString()}
          {unit && !isUnlimited && ` ${unit}`}
        </span>
      </div>
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: isUnlimited ? "0%" : `${percentage}%` }}
        />
      </div>
      {!isUnlimited && percentage >= 90 && (
        <p className="text-xs text-red-600">
          Approaching limit - consider upgrading your plan
        </p>
      )}
    </div>
  );
}
