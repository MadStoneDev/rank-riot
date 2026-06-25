"use client";

import {
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconAlertCircle,
  IconTrendingUp,
  IconCpu,
  IconPalette,
  IconShield,
  IconAccessible,
  IconBolt,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface AuditResultsProps {
  results: any;
}

export default function AuditResults({ results }: AuditResultsProps) {
  // Safety check - don't render if critical data is missing
  if (
    !results ||
    results.overall_score === null ||
    results.overall_score === undefined
  ) {
    return (
      <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
        <p className="text-[var(--color-text-secondary)]">Audit results are being processed...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--color-score-good)]";
    if (score >= 60) return "text-[var(--color-score-warning)]";
    return "text-[var(--color-score-critical)]";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-[var(--color-score-good-muted)]";
    if (score >= 60) return "bg-[var(--color-score-warning-muted)]";
    return "bg-[var(--color-score-critical-muted)]";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Poor";
    return "Critical";
  };

  // Safe accessors with defaults
  const modernizationScore = results.modernization_score ?? 0;
  const performanceScore = results.performance_score ?? 0;
  const completenessScore = results.completeness_score ?? 0;
  const modernStandardsScore = results.modern_standards?.score ?? 0;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Overall Audit Score</h2>
          <div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBg(
              results.overall_score,
            )}`}
          >
            <div className="text-center">
              <span
                className={`text-4xl font-bold ${getScoreColor(
                  results.overall_score,
                )}`}
              >
                {results.overall_score}
              </span>
              <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
                {getScoreLabel(results.overall_score)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Modernization"
          score={modernizationScore}
          description="Technology stack"
          icon={<IconCpu className="w-6 h-6" />}
        />
        <ScoreCard
          title="Performance"
          score={performanceScore}
          description="Load speed"
          icon={<IconTrendingUp className="w-6 h-6" />}
        />
        <ScoreCard
          title="Completeness"
          score={completenessScore}
          description="Essential pages"
          icon={<IconCircleDashedCheck className="w-6 h-6" />}
        />
        <ScoreCard
          title="Standards"
          score={modernStandardsScore}
          description="Web standards"
          icon={<IconShield className="w-6 h-6" />}
        />
      </div>

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recommendations</h3>
          <div className="space-y-3">
            {results.recommendations.map((rec: any, index: number) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Tech Stack */}
      {results.tech_stack && (
        <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <IconCpu className="w-5 h-5 mr-2" />
            Technology Stack
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {results.tech_stack.framework && (
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Framework</p>
                <p className="font-semibold">{results.tech_stack.framework}</p>
              </div>
            )}
            {results.tech_stack.cms && (
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">CMS</p>
                <p className="font-semibold">{results.tech_stack.cms}</p>
              </div>
            )}
          </div>
          {results.tech_stack.libraries &&
            results.tech_stack.libraries.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">Libraries</p>
                <div className="flex flex-wrap gap-2">
                  {results.tech_stack.libraries.map(
                    (lib: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-full text-sm"
                      >
                        {lib}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          {results.tech_stack.analytics &&
            results.tech_stack.analytics.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">Analytics</p>
                <div className="flex flex-wrap gap-2">
                  {results.tech_stack.analytics.map(
                    (tool: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] rounded-full text-sm"
                      >
                        {tool}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Design Analysis */}
      {results.design_analysis && (
        <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <IconPalette className="w-5 h-5 mr-2" />
            Design Analysis
          </h3>

          {results.design_analysis.fonts &&
            results.design_analysis.fonts.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">Fonts Detected</p>
                <div className="flex flex-wrap gap-2">
                  {results.design_analysis.fonts
                    .slice(0, 5)
                    .map((font: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] rounded text-sm"
                      >
                        {font}
                      </span>
                    ))}
                </div>
              </div>
            )}

          {results.design_analysis.socialPlatforms &&
            results.design_analysis.socialPlatforms.length > 0 && (
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">Social Presence</p>
                <div className="flex flex-wrap gap-2">
                  {results.design_analysis.socialPlatforms.map(
                    (platform: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] rounded-full text-sm capitalize"
                      >
                        {platform}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

          {results.design_analysis.copyrightYear && (
            <div className="mt-4 p-3 bg-[var(--color-surface-overlay)] rounded">
              <p className="text-sm">
                <span className="font-semibold">Copyright Year:</span>{" "}
                {results.design_analysis.copyrightYear}
                {results.design_analysis.copyrightYear <
                  new Date().getFullYear() && (
                  <span className="ml-2 text-orange-600 text-xs">
                    (Outdated - consider updating)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Missing Pages */}
      {results.missing_pages && results.missing_pages.length > 0 && (
        <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-[var(--color-score-critical)]">
            Missing Essential Pages
          </h3>
          <ul className="space-y-2">
            {results.missing_pages.map((page: string, index: number) => (
              <li key={index} className="flex items-center text-[var(--color-score-critical)]">
                <IconCircleDashedX className="w-5 h-5 mr-2" />
                <span className="capitalize">{page}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Performance Metrics */}
      {results.performance_metrics && (
        <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.performance_metrics.avgLoadTime !== undefined && (
              <div className="p-4 bg-[var(--color-surface-overlay)] rounded">
                <p className="text-sm text-[var(--color-text-secondary)]">Average Load Time</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {(results.performance_metrics.avgLoadTime / 1000).toFixed(2)}s
                </p>
              </div>
            )}
            {results.performance_metrics.avgFirstByteTime !== undefined && (
              <div className="p-4 bg-[var(--color-surface-overlay)] rounded">
                <p className="text-sm text-[var(--color-text-secondary)]">Time to First Byte</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {Number(results.performance_metrics.avgFirstByteTime).toFixed(2)}ms
                </p>
              </div>
            )}
            {results.performance_metrics.avgPageSize !== undefined && (
              <div className="p-4 bg-[var(--color-surface-overlay)] rounded">
                <p className="text-sm text-[var(--color-text-secondary)]">Average Page Size</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {(
                    results.performance_metrics.avgPageSize /
                    1024 /
                    1024
                  ).toFixed(2)}
                  MB
                </p>
              </div>
            )}
          </div>

          {results.performance_metrics.slowestPages &&
            results.performance_metrics.slowestPages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Slowest Pages
                </p>
                <div className="space-y-2">
                  {results.performance_metrics.slowestPages
                    .slice(0, 5)
                    .map((page: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="truncate text-[var(--color-text-secondary)] max-w-md">
                          {page.url}
                        </span>
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {(page.loadTime / 1000).toFixed(2)}s
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {results.performance_metrics.findings &&
            results.performance_metrics.findings.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Performance Findings
                </p>
                <FindingsList findings={results.performance_metrics.findings} />
              </div>
            )}
        </div>
      )}

      {/* Standards & Accessibility */}
      {results.modern_standards?.findings &&
        results.modern_standards.findings.length > 0 && (
          <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <IconAccessible className="w-5 h-5 mr-2" />
              Standards & Accessibility
            </h3>
            <FindingsList findings={results.modern_standards.findings} />
          </div>
        )}
    </div>
  );
}

function ScoreCard({
  title,
  score,
  description,
  icon,
}: {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--color-score-good)]";
    if (score >= 60) return "text-[var(--color-score-warning)]";
    return "text-[var(--color-score-critical)]";
  };

  return (
    <div className="bg-[var(--color-surface-raised)] rounded-lg shadow p-4">
      <div className="flex items-center mb-2">
        <div className="text-secondary">{icon}</div>
        <h4 className="font-semibold text-[var(--color-text-secondary)] ml-2">{title}</h4>
      </div>
      <p className="text-sm text-[var(--color-text-muted)] mb-2">{description}</p>
      <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <IconCircleDashedX className="w-5 h-5 text-[var(--color-score-critical)]" />;
      case "important":
        return <IconAlertCircle className="w-5 h-5 text-[var(--color-score-warning)]" />;
      default:
        return <IconCircleDashedCheck className="w-5 h-5 text-[var(--color-primary)]" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      critical: "bg-[var(--color-score-critical-muted)] text-[var(--color-score-critical)]",
      important: "bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]",
      "nice-to-have": "bg-[var(--color-primary-muted)] text-[var(--color-primary)]",
    };
    return styles[type as keyof typeof styles] || styles["nice-to-have"];
  };

  const getEffortBadge = (effort: string) => {
    const styles = {
      low: "bg-[var(--color-score-good-muted)] text-[var(--color-score-good)]",
      medium: "bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)]",
      high: "bg-[var(--color-score-critical-muted)] text-[var(--color-score-critical)]",
    };
    return (
      styles[effort as keyof typeof styles] || "bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)]"
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-3">
        {getTypeIcon(recommendation.type)}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="font-semibold">{recommendation.title}</h4>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadge(
                recommendation.type,
              )}`}
            >
              {recommendation.type}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getEffortBadge(
                recommendation.effort,
              )}`}
            >
              {recommendation.effort} effort
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">
            {recommendation.description}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] italic">
            <strong>Impact:</strong> {recommendation.impact}
          </p>
        </div>
      </div>
    </div>
  );
}

function FindingsList({ findings }: { findings: string[] }) {
  const negativePatterns = /^no |^missing |not |lack|insufficient|without|outdated|slow|large |critical|invisible/i;

  return (
    <div className="space-y-2">
      {findings.map((finding: string, index: number) => {
        const isNegative = negativePatterns.test(finding);
        return (
          <div key={index} className="flex items-start gap-2 text-sm">
            {isNegative ? (
              <IconX className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-score-critical)]" />
            ) : (
              <IconCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-score-good)]" />
            )}
            <span className={isNegative ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}>
              {finding}
            </span>
          </div>
        );
      })}
    </div>
  );
}
