"use client";

import {
  IconNetwork,
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { SiteArchitectureData } from "@/types/site-architecture";
import DepthDistributionCard from "@/components/site-architecture/DepthDistributionCard";
import OrphanPagesCard from "@/components/site-architecture/OrphanPagesCard";
import DeepPagesCard from "@/components/site-architecture/DeepPagesCard";
import InternalLinkingCard from "@/components/site-architecture/InternalLinkingCard";

interface SiteArchitectureProps {
  data: SiteArchitectureData;
  projectId: string;
}

export default function SiteArchitecture({
  data,
  projectId,
}: SiteArchitectureProps) {
  const { summary } = data;

  const hasAnyIssues =
    data.orphanPages.length > 0 || data.deepPages.length > 0;

  const criticalCount = data.orphanPages.length;
  const warningCount = data.deepPages.length;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconNetwork className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900">
                Site Architecture
              </h3>
              <p className="text-sm text-neutral-500">
                {summary.totalPages} pages | Avg depth: {summary.avgDepth} | Max
                depth: {summary.maxDepth}
              </p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <IconAlertCircle className="h-4 w-4" />
                <span>{criticalCount} Orphan</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                <IconAlertTriangle className="h-4 w-4" />
                <span>{warningCount} Deep</span>
              </div>
            )}
            {!hasAnyIssues && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <IconCircleCheck className="h-4 w-4" />
                <span>Good Structure</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Depth Distribution */}
          <DepthDistributionCard
            distribution={data.depthDistribution}
            projectId={projectId}
          />

          {/* Orphan Pages */}
          <OrphanPagesCard pages={data.orphanPages} projectId={projectId} />

          {/* Deep Pages */}
          <DeepPagesCard pages={data.deepPages} projectId={projectId} />

          {/* Internal Linking */}
          <InternalLinkingCard
            mostLinked={data.pagesWithMostLinks}
            leastLinked={data.pagesWithFewestLinks}
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  );
}
