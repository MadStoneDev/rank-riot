"use client";

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { calculatePageScore, type PageScoreInput, type PageScoreIssue as SEOIssue } from "@/utils/page-score";
import ScoreRing from "@/components/ui/ScoreRing";
import Badge from "@/components/ui/Badge";

interface SEOHealthScoreProps {
  page: PageScoreInput & {
    word_count?: number | null;
    twitter_card?: Record<string, any> | null;
    structured_data?: any;
  };
}

export default function SEOHealthScore({ page }: SEOHealthScoreProps) {
  const { score, issues } = calculatePageScore(page);

  const critical = issues.filter((i) => i.type === "critical").length;
  const warnings = issues.filter((i) => i.type === "warning").length;
  const passed = issues.filter((i) => i.type === "passed").length;

  return (
    <div className="glass-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ScoreRing score={score} size="lg" showLabel={false} />
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              SEO Health Score
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {score >= 80
                ? "Great job! Your page is well optimized."
                : score >= 60
                  ? "Good, but there's room for improvement."
                  : "Needs attention. Several issues found."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {critical > 0 && (
            <Badge variant="critical" size="md">
              <IconAlertCircle className="h-4 w-4" />
              {critical} Critical
            </Badge>
          )}
          {warnings > 0 && (
            <Badge variant="warning" size="md">
              <IconAlertTriangle className="h-4 w-4" />
              {warnings} Warning{warnings !== 1 ? "s" : ""}
            </Badge>
          )}
          {passed > 0 && (
            <Badge variant="good" size="md">
              <IconCircleCheck className="h-4 w-4" />
              {passed} Passed
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export { calculatePageScore as calculateSEOScore };
export type { SEOIssue };
