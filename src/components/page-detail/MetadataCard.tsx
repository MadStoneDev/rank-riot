"use client";

import { IconArticle, IconLabel } from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";

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
      return "bg-green-500";
    if (current < optimal.min * 0.6 || current > max * 0.95) return "bg-red-500";
    return "bg-orange-500";
  };

  return (
    <div className="mt-2 w-full">
      <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
        {/* Optimal range indicator */}
        <div
          className="absolute h-full bg-green-200"
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
      <div className="mt-1 flex justify-between text-xs text-neutral-500">
        <span>{current} chars</span>
        <span>Optimal: {optimal.min}-{optimal.max}</span>
      </div>
    </div>
  );
}

function FeedbackBadge({ feedback }: { feedback: FeedbackResult }) {
  const colorClasses = {
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[feedback.color]}`}
    >
      {feedback.text}
    </span>
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
        <span className="text-sm text-neutral-500">
          {titleFeedback.color === "green" && descriptionFeedback.color === "green"
            ? "All good"
            : "Needs attention"}
        </span>
      }
    >
      <div className="divide-y divide-neutral-200">
        {/* Title section */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 rounded-full p-1 text-primary">
                <IconLabel className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-neutral-900">Title</h4>
                  <FeedbackBadge feedback={titleFeedback} />
                </div>
                <p
                  className={`text-sm ${title ? "text-neutral-600" : "text-red-600"} break-words`}
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
              <div className="flex-shrink-0 rounded-full p-1 text-primary">
                <IconArticle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-neutral-900">
                    Description
                  </h4>
                  <FeedbackBadge feedback={descriptionFeedback} />
                </div>
                <p
                  className={`text-sm ${metaDescription ? "text-neutral-600" : "text-red-600"} break-words`}
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
