"use client";

import ScoreRing from "@/components/ui/ScoreRing";

interface HealthScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * Legacy wrapper around ScoreRing for backward compatibility.
 */
export default function HealthScoreCircle({
  score,
}: HealthScoreCircleProps) {
  return <ScoreRing score={Math.max(0, Math.min(100, Math.round(score)))} size="sm" showLabel={false} />;
}
