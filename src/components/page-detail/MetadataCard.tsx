"use client";

import { IconArticle, IconLabel } from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import Badge from "@/components/ui/Badge";

interface MetadataCardProps {
  title?: string | null;
  metaDescription?: string | null;
}

interface FeedbackResult {
  text: string;
  color: "red" | "orange" | "green";
}

function getTitleFeedback(title?: string | null): FeedbackResult {
  if (!title || title.length === 0) {
    return { text: "Missing", color: "red" };
  }
  const length = title.length;
  if (length < 30) return { text: "Too Short", color: "red" };
  if (length < 50) return { text: "Could be longer", color: "orange" };
  if (length <= 60) return { text: "Great", color: "green" };
  if (length <= 70) return { text: "Slightly long", color: "orange" };
  return { text: "Too Long", color: "red" };
}

function getDescriptionFeedback(description?: string | null): FeedbackResult {
  if (!description || description.length === 0) {
    return { text: "Missing", color: "red" };
  }
  const length = description.length;
  if (length < 70) return { text: "Too Short", color: "red" };
  if (length < 120) return { text: "Could be longer", color: "orange" };
  if (length <= 155) return { text: "Great", color: "green" };
  if (length <= 165) return { text: "Slightly long", color: "orange" };
  return { text: "Too Long", color: "red" };
}

function LengthIndicator({
  current,
  optimal,
  max,
}: {
  current: number;
  optimal: { min: number; max: number };
  max: number;
}) {
  const percentage = Math.min((current / max) * 100, 100);
  const optimalStart = (optimal.min / max) * 100;
  const optimalEnd = (optimal.max / max) * 100;

  const getBarColor = () => {
    if (current >= optimal.min && current <= optimal.max)
      return "bg-[var(--color-score-good)]";
    if (current < optimal.min * 0.6 || current > max * 0.95) return "bg-[var(--color-score-critical)]";
    return "bg-[var(--color-score-warning)]";
  };

  return (
    <div className="mt-2 w-full">
      <div className="relative h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
        {/* Optimal range indicator */}
        <div
          className="absolute h-full bg-[var(--color-score-good-muted)]"
          style={{
            left: `${optimalStart}%`,
            width: `${optimalEnd - optimalStart}%`,
          }}
        />
        {/* Current value bar */}
        <div
          className={`absolute h-full ${getBarColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>{current} chars</span>
        <span>Optimal: {optimal.min}-{optimal.max}</span>
      </div>
    </div>
  );
}

function FeedbackBadge({ feedback }: { feedback: FeedbackResult }) {
  const variantMap: Record<string, "critical" | "warning" | "good"> = {
    red: "critical",
    orange: "warning",
    green: "good",
  };

  return (
    <Badge variant={variantMap[feedback.color]}>
      {feedback.text}
    </Badge>
  );
}

export default function MetadataCard({
  title,
  metaDescription,
}: MetadataCardProps) {
  const titleFeedback = getTitleFeedback(title);
  const descriptionFeedback = getDescriptionFeedback(metaDescription);

  const titleLength = title?.length || 0;
  const descriptionLength = metaDescription?.length || 0;

  return (
    <CollapsibleSection
      title="Metadata"
      badge={
        <span className="text-sm text-[var(--color-text-muted)]">
          {titleFeedback.color === "green" && descriptionFeedback.color === "green"
            ? "All good"
            : "Needs attention"}
        </span>
      }
    >
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {/* Title section */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 rounded-full p-1 text-[var(--color-primary)]">
                <IconLabel className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Title</h4>
                  <FeedbackBadge feedback={titleFeedback} />
                </div>
                <p
                  className={`text-sm ${title ? "text-[var(--color-text-secondary)]" : "text-[var(--color-score-critical)]"} break-words`}
                >
                  {title || "No title found"}
                </p>
                {title && (
                  <LengthIndicator
                    current={titleLength}
                    optimal={{ min: 50, max: 60 }}
                    max={80}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 rounded-full p-1 text-[var(--color-primary)]">
                <IconArticle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Description
                  </h4>
                  <FeedbackBadge feedback={descriptionFeedback} />
                </div>
                <p
                  className={`text-sm ${metaDescription ? "text-[var(--color-text-secondary)]" : "text-[var(--color-score-critical)]"} break-words`}
                >
                  {metaDescription || "No meta description found"}
                </p>
                {metaDescription && (
                  <LengthIndicator
                    current={descriptionLength}
                    optimal={{ min: 120, max: 155 }}
                    max={180}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}

export { getTitleFeedback, getDescriptionFeedback };
