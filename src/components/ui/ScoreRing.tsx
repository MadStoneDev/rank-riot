"use client";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: { width: 48, stroke: 4, font: "text-sm", labelFont: "text-[9px]" },
  md: { width: 64, stroke: 5, font: "text-lg", labelFont: "text-[10px]" },
  lg: { width: 80, stroke: 6, font: "text-xl", labelFont: "text-xs" },
  xl: { width: 112, stroke: 7, font: "text-3xl", labelFont: "text-xs" },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--color-score-good)";
  if (score >= 60) return "var(--color-score-warning)";
  return "var(--color-score-critical)";
}

function getGlowClass(score: number): string {
  if (score >= 80) return "glow-green";
  if (score >= 60) return "glow-amber";
  return "glow-red";
}

export default function ScoreRing({
  score,
  size = "md",
  label,
  showLabel = true,
  className = "",
}: ScoreRingProps) {
  const { width, stroke, font, labelFont } = SIZES[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`relative ${getGlowClass(score)} rounded-full`}
        style={{ width, height: width }}
      >
        <svg
          width={width}
          height={width}
          className="transform -rotate-90"
          style={
            {
              "--ring-circumference": `${circumference}`,
              "--ring-offset": `${offset}`,
            } as React.CSSProperties
          }
        >
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth={stroke}
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring-animate"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${font}`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && label && (
        <span className={`${labelFont} text-[var(--color-text-muted)] text-center`}>
          {label}
        </span>
      )}
    </div>
  );
}

export { getScoreColor, getGlowClass };
