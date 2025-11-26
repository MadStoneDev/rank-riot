"use client";

import {
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconAlertCircle,
  IconTrendingUp,
  IconCpu,
  IconPalette,
  IconShield,
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
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-neutral-600">Audit results are being processed...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
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
      <div className="bg-white rounded-lg shadow p-6">
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
              <p className="text-xs mt-1 text-neutral-600">
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
        <div className="bg-white rounded-lg shadow p-6">
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <IconCpu className="w-5 h-5 mr-2" />
            Technology Stack
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {results.tech_stack.framework && (
              <div>
                <p className="text-sm text-neutral-600">Framework</p>
                <p className="font-semibold">{results.tech_stack.framework}</p>
              </div>
            )}
            {results.tech_stack.cms && (
              <div>
                <p className="text-sm text-neutral-600">CMS</p>
                <p className="font-semibold">{results.tech_stack.cms}</p>
              </div>
            )}
          </div>
          {results.tech_stack.libraries &&
            results.tech_stack.libraries.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-neutral-600 mb-2">Libraries</p>
                <div className="flex flex-wrap gap-2">
                  {results.tech_stack.libraries.map(
                    (lib: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
                <p className="text-sm text-neutral-600 mb-2">Analytics</p>
                <div className="flex flex-wrap gap-2">
                  {results.tech_stack.analytics.map(
                    (tool: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <IconPalette className="w-5 h-5 mr-2" />
            Design Analysis
          </h3>

          {results.design_analysis.fonts &&
            results.design_analysis.fonts.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-neutral-600 mb-2">Fonts Detected</p>
                <div className="flex flex-wrap gap-2">
                  {results.design_analysis.fonts
                    .slice(0, 5)
                    .map((font: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded text-sm"
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
                <p className="text-sm text-neutral-600 mb-2">Social Presence</p>
                <div className="flex flex-wrap gap-2">
                  {results.design_analysis.socialPlatforms.map(
                    (platform: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize"
                      >
                        {platform}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

          {results.design_analysis.copyrightYear && (
            <div className="mt-4 p-3 bg-neutral-50 rounded">
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-red-600">
            Missing Essential Pages
          </h3>
          <ul className="space-y-2">
            {results.missing_pages.map((page: string, index: number) => (
              <li key={index} className="flex items-center text-red-600">
                <IconCircleDashedX className="w-5 h-5 mr-2" />
                <span className="capitalize">{page}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Performance Metrics */}
      {results.performance_metrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.performance_metrics.avgLoadTime !== undefined && (
              <div className="p-4 bg-neutral-50 rounded">
                <p className="text-sm text-neutral-600">Average Load Time</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {(results.performance_metrics.avgLoadTime / 1000).toFixed(2)}s
                </p>
              </div>
            )}
            {results.performance_metrics.avgFirstByteTime !== undefined && (
              <div className="p-4 bg-neutral-50 rounded">
                <p className="text-sm text-neutral-600">Time to First Byte</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {results.performance_metrics.avgFirstByteTime}ms
                </p>
              </div>
            )}
            {results.performance_metrics.avgPageSize !== undefined && (
              <div className="p-4 bg-neutral-50 rounded">
                <p className="text-sm text-neutral-600">Average Page Size</p>
                <p className="text-2xl font-bold text-neutral-900">
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
                <p className="text-sm font-medium text-neutral-700 mb-2">
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
                        <span className="truncate text-neutral-600 max-w-md">
                          {page.url}
                        </span>
                        <span className="font-medium text-neutral-900">
                          {(page.loadTime / 1000).toFixed(2)}s
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-2">
        <div className="text-secondary">{icon}</div>
        <h4 className="font-semibold text-neutral-700 ml-2">{title}</h4>
      </div>
      <p className="text-sm text-neutral-500 mb-2">{description}</p>
      <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <IconCircleDashedX className="w-5 h-5 text-red-500" />;
      case "important":
        return <IconAlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <IconCircleDashedCheck className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      critical: "bg-red-100 text-red-800",
      important: "bg-yellow-100 text-yellow-800",
      "nice-to-have": "bg-blue-100 text-blue-800",
    };
    return styles[type as keyof typeof styles] || styles["nice-to-have"];
  };

  const getEffortBadge = (effort: string) => {
    const styles = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return (
      styles[effort as keyof typeof styles] || "bg-neutral-100 text-neutral-800"
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
          <p className="text-sm text-neutral-600 mb-2">
            {recommendation.description}
          </p>
          <p className="text-sm text-neutral-500 italic">
            <strong>Impact:</strong> {recommendation.impact}
          </p>
        </div>
      </div>
    </div>
  );
}
