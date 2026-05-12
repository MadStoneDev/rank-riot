import Link from "next/link";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import Badge from "@/components/ui/Badge";

interface AttentionIssue {
  id: string;
  severity: string;
  description: string;
  projectId: string;
  projectName: string;
  pageId: string | null;
  pageUrl: string;
}

interface NeedsAttentionCardProps {
  issues: AttentionIssue[];
}

const severityDot: Record<string, string> = {
  critical: "text-[var(--color-severity-critical)]",
  high: "text-[var(--color-severity-high)]",
  medium: "text-[var(--color-severity-medium)]",
  low: "text-[var(--color-severity-low)]",
};

const severityBadgeVariant: Record<string, "severity-critical" | "severity-high" | "severity-medium" | "severity-low"> = {
  critical: "severity-critical",
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
};

export default function NeedsAttentionCard({
  issues,
}: NeedsAttentionCardProps) {
  if (issues.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
          Needs Attention
        </h3>
        <div className="text-center py-6">
          <IconCircleCheck className="w-10 h-10 mx-auto text-[var(--color-score-good)] mb-2" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No critical issues found. Great work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Needs Attention
        </h3>
        <Badge variant="severity-critical">{issues.length} issues</Badge>
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            href={
              issue.pageId
                ? `/projects/${issue.projectId}/pages/${issue.pageId}`
                : `/projects/${issue.projectId}`
            }
            className="block px-5 py-3 hover:bg-[var(--color-surface-overlay)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <IconAlertCircle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${severityDot[issue.severity] || "text-[var(--color-text-muted)]"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)]">
                  {issue.description}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                  {issue.projectName} &middot; {issue.pageUrl}
                </p>
              </div>
              <Badge
                variant={severityBadgeVariant[issue.severity] || "neutral"}
                className="flex-shrink-0 capitalize"
              >
                {issue.severity}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
