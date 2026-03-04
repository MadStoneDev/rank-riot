import Link from "next/link";
import { IconAlertCircle } from "@tabler/icons-react";

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

const severityColor: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

const severityDot: Record<string, string> = {
  critical: "text-red-500",
  high: "text-orange-500",
  medium: "text-yellow-500",
  low: "text-blue-500",
};

export default function NeedsAttentionCard({ issues }: NeedsAttentionCardProps) {
  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Needs Attention</h3>
        <div className="text-center py-6">
          <IconAlertCircle className="w-10 h-10 mx-auto text-green-400 mb-2" />
          <p className="text-sm text-neutral-500">No critical issues found. Great work!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Needs Attention</h3>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
          {issues.length} issues
        </span>
      </div>
      <div className="divide-y divide-neutral-100">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            href={
              issue.pageId
                ? `/projects/${issue.projectId}/pages/${issue.pageId}`
                : `/projects/${issue.projectId}`
            }
            className="block px-6 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <IconAlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${severityDot[issue.severity] || "text-neutral-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800">{issue.description}</p>
                <p className="text-xs text-neutral-400 mt-0.5 truncate">
                  {issue.projectName} &middot; {issue.pageUrl}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize border flex-shrink-0 ${severityColor[issue.severity] || "bg-neutral-100 text-neutral-600"}`}>
                {issue.severity}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
