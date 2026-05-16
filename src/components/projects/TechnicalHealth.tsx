"use client";

import {
  IconHeartRateMonitor,
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { TechnicalHealthData } from "@/types/technical-health";
import HttpStatusCard from "@/components/technical-health/HttpStatusCard";
import RedirectsCard from "@/components/technical-health/RedirectsCard";
import BrokenLinksCard from "@/components/technical-health/BrokenLinksCard";
import PerformanceCard from "@/components/technical-health/PerformanceCard";
import IndexabilityCard from "@/components/technical-health/IndexabilityCard";

interface TechnicalHealthProps {
  data: TechnicalHealthData;
  projectId: string;
}

export default function TechnicalHealth({
  data,
  projectId,
}: TechnicalHealthProps) {
  const { summary } = data;

  const hasAnyIssues =
    data.brokenLinks.length > 0 ||
    data.redirectPages.length > 0 ||
    data.slowPages.length > 0 ||
    data.largePages.length > 0 ||
    data.nonIndexablePages.length > 0 ||
    data.statusDistribution.some(
      (d) => d.category === "4xx" || d.category === "5xx"
    );

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconHeartRateMonitor className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                Technical Health
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                HTTP status, performance, and indexability analysis
              </p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-3">
            {summary.critical > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-critical-muted)] text-[var(--color-severity-critical)] rounded-full text-sm font-medium">
                <IconAlertCircle className="h-4 w-4" />
                <span>{summary.critical} Critical</span>
              </div>
            )}
            {summary.warnings > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-severity-high)]/10 text-[var(--color-severity-high)] rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>{summary.warnings} Warnings</span>
              </div>
            )}
            {!hasAnyIssues && (
              <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>All Healthy</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HTTP Status */}
          <HttpStatusCard
            distribution={data.statusDistribution}
            projectId={projectId}
          />

          {/* Broken Links */}
          <BrokenLinksCard links={data.brokenLinks} projectId={projectId} />

          {/* Redirects */}
          <RedirectsCard pages={data.redirectPages} projectId={projectId} />

          {/* Performance */}
          <PerformanceCard
            slowPages={data.slowPages}
            largePages={data.largePages}
            projectId={projectId}
          />

          {/* Indexability */}
          <IndexabilityCard
            pages={data.nonIndexablePages}
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  );
}
