"use client";

interface HealthScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function HealthScoreCircle({
  score,
  size = 64,
  strokeWidth = 6,
}: HealthScoreCircleProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70 ? "#16a34a" : clamped >= 40 ? "#ca8a04" : "#dc2626";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span
        className="absolute text-sm font-bold"
        style={{ color }}
      >
        {clamped}
      </span>
    </div>
  );
}
