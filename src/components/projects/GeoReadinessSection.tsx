"use client";

import { useState } from "react";
import {
  IconGlobe,
  IconFileText,
  IconRobot,
  IconSitemap,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconShieldCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

interface GeoReadinessSectionProps {
  siteLevelData: {
    llms_txt?: {
      exists: boolean;
      content?: string;
      fields?: Record<string, string>;
    };
    robots_txt?: {
      exists: boolean;
      ai_bots_blocked: string[];
      ai_bots_allowed: string[];
      blocked_paths: Array<{ user_agent: string; paths: string[] }>;
      sitemap_urls: string[];
    };
    sitemap_validation?: {
      found: boolean;
      url?: string;
      valid: boolean;
      url_count?: number;
      errors: string[];
      has_lastmod: boolean;
      urls_in_sitemap_not_crawled: string[];
      crawled_not_in_sitemap: string[];
    };
  } | null;
}

const SCORE_COLORS = {
  good: "var(--color-score-good)",
  warning: "var(--color-score-warning)",
  critical: "var(--color-score-critical)",
};

function calculateGeoScore(data: NonNullable<GeoReadinessSectionProps["siteLevelData"]>): number {
  let score = 0;

  // llms.txt exists: +25 points
  if (data.llms_txt?.exists) {
    score += 25;
  }

  // robots.txt exists: +15 points
  if (data.robots_txt?.exists) {
    score += 15;
  }

  // No AI bots blocked: +20 points (deduct 3 per blocked bot, min 0 for this component)
  if (data.robots_txt) {
    const blockedCount = data.robots_txt.ai_bots_blocked.length;
    score += Math.max(0, 20 - blockedCount * 3);
  }

  // Sitemap found: +15 points
  if (data.sitemap_validation?.found) {
    score += 15;
  }

  // Sitemap valid: +10 points
  if (data.sitemap_validation?.valid) {
    score += 10;
  }

  // Sitemap has lastmod: +5 points
  if (data.sitemap_validation?.has_lastmod) {
    score += 5;
  }

  // Sitemap coverage: up to +10 points
  if (data.sitemap_validation) {
    const notInSitemap = data.sitemap_validation.crawled_not_in_sitemap.length;
    const urlCount = data.sitemap_validation.url_count ?? 0;
    const totalCrawled = urlCount + notInSitemap;
    if (totalCrawled > 0) {
      const coverage = urlCount / totalCrawled;
      score += Math.round(coverage * 10);
    }
  }

  return Math.min(score, 100);
}

function getScoreColor(score: number): string {
  if (score >= 60) return SCORE_COLORS.good;
  if (score >= 30) return SCORE_COLORS.warning;
  return SCORE_COLORS.critical;
}

function getScoreLabel(score: number): { label: string; icon: React.ReactNode; bgClass: string; textClass: string } {
  if (score >= 60) {
    return {
      label: "Good",
      icon: <IconCircleCheck className="h-4 w-4" />,
      bgClass: "bg-[var(--color-score-good-muted)]",
      textClass: "text-[var(--color-score-good)]",
    };
  }
  if (score >= 30) {
    return {
      label: "Needs Work",
      icon: <IconAlertTriangle className="h-4 w-4" />,
      bgClass: "bg-[var(--color-score-warning-muted)]",
      textClass: "text-[var(--color-score-warning)]",
    };
  }
  return {
    label: "Low",
    icon: <IconAlertCircle className="h-4 w-4" />,
    bgClass: "bg-[var(--color-score-critical-muted)]",
    textClass: "text-[var(--color-severity-critical)]",
  };
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer"
      >
        {isOpen ? <IconChevronUp className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
        {title}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

function CappedUrlList({ urls, cap = 10 }: { urls: string[]; cap?: number }) {
  const visible = urls.slice(0, cap);
  const remaining = urls.length - cap;
  return (
    <ul className="space-y-1 text-xs text-[var(--color-text-muted)] font-mono break-all">
      {visible.map((url, i) => (
        <li key={i} className="pl-2 border-l-2 border-[var(--color-border-subtle)]">
          {url}
        </li>
      ))}
      {remaining > 0 && (
        <li className="pl-2 text-[var(--color-text-secondary)] italic">
          and {remaining} more...
        </li>
      )}
    </ul>
  );
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-elevated)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
    </div>
  );
}

function LlmsTxtCard({
  data,
}: {
  data?: {
    exists: boolean;
    content?: string;
    fields?: Record<string, string>;
  };
}) {
  const exists = data?.exists ?? false;
  const fields = data?.fields;
  const content = data?.content;

  return (
    <div className="bg-[var(--color-surface-overlay)] rounded-xl p-5 flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="p-1.5 rounded-lg"
          style={{
            backgroundColor: exists
              ? "color-mix(in srgb, var(--color-score-good) 15%, transparent)"
              : "color-mix(in srgb, var(--color-score-warning) 15%, transparent)",
          }}
        >
          <IconFileText
            className="h-5 w-5"
            style={{ color: exists ? SCORE_COLORS.good : SCORE_COLORS.warning }}
          />
        </div>
        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">llms.txt</h4>
        {exists ? (
          <IconCircleCheck className="h-4 w-4 ml-auto text-[var(--color-score-good)]" />
        ) : (
          <IconAlertTriangle className="h-4 w-4 ml-auto text-[var(--color-score-warning)]" />
        )}
      </div>

      {exists ? (
        <>
          <p className="text-xs text-[var(--color-score-good)] font-medium mb-2">llms.txt Found</p>
          {fields && Object.keys(fields).length > 0 && (
            <div className="space-y-1.5">
              {Object.entries(fields).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-xs">
                  <span className="text-[var(--color-text-muted)] shrink-0 capitalize">{key}:</span>
                  <span className="text-[var(--color-text-secondary)] break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
          {content && (
            <CollapsibleSection title="View Content">
              <pre className="text-xs leading-relaxed text-[var(--color-text-muted)] bg-[var(--color-surface-base)] rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
                {content}
              </pre>
            </CollapsibleSection>
          )}
        </>
      ) : (
        <div className="flex-1">
          <p className="text-xs text-[var(--color-score-warning)] font-medium mb-2">No llms.txt</p>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            An <code className="text-[var(--color-text-secondary)] bg-[var(--color-surface-base)] px-1 rounded">llms.txt</code> file
            tells AI models how to understand and represent your site. Adding one improves how LLMs cite and describe your content.
          </p>
        </div>
      )}
    </div>
  );
}

function AiBotCrawlabilityCard({
  data,
}: {
  data?: {
    exists: boolean;
    ai_bots_blocked: string[];
    ai_bots_allowed: string[];
    blocked_paths: Array<{ user_agent: string; paths: string[] }>;
    sitemap_urls: string[];
  };
}) {
  const exists = data?.exists ?? false;
  const blocked = data?.ai_bots_blocked ?? [];
  const allowed = data?.ai_bots_allowed ?? [];

  return (
    <div className="bg-[var(--color-surface-overlay)] rounded-xl p-5 flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="p-1.5 rounded-lg"
          style={{
            backgroundColor: exists
              ? "color-mix(in srgb, var(--color-primary) 15%, transparent)"
              : "color-mix(in srgb, var(--color-score-warning) 15%, transparent)",
          }}
        >
          <IconRobot
            className="h-5 w-5"
            style={{ color: exists ? "var(--color-primary)" : SCORE_COLORS.warning }}
          />
        </div>
        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">AI Bot Crawlability</h4>
        {exists ? (
          blocked.length === 0 ? (
            <IconShieldCheck className="h-4 w-4 ml-auto text-[var(--color-score-good)]" />
          ) : (
            <IconAlertTriangle className="h-4 w-4 ml-auto text-[var(--color-score-warning)]" />
          )
        ) : (
          <IconAlertCircle className="h-4 w-4 ml-auto text-[var(--color-score-critical)]" />
        )}
      </div>

      {!exists ? (
        <div className="flex-1">
          <p className="text-xs text-[var(--color-score-critical)] font-medium mb-1">No robots.txt</p>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            No robots.txt file was found. While AI bots can crawl freely, having a robots.txt helps you control access explicitly.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            <IconCircleCheck className="h-3.5 w-3.5 inline mr-1 text-[var(--color-score-good)]" />
            robots.txt found
          </p>

          {blocked.length > 0 && (
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 font-medium">
                Blocked AI Bots
              </p>
              <div className="flex flex-wrap gap-1.5">
                {blocked.map((bot) => (
                  <span
                    key={bot}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color-mix(in_srgb,var(--color-score-critical)_15%,transparent)] text-[var(--color-score-critical)]"
                  >
                    {bot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {allowed.length > 0 && (
            <div className="mb-2">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 font-medium">
                Allowed AI Bots
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allowed.map((bot) => (
                  <span
                    key={bot}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color-mix(in_srgb,var(--color-score-good)_15%,transparent)] text-[var(--color-score-good)]"
                  >
                    {bot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {blocked.length === 0 && allowed.length === 0 && (
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              <IconInfoCircle className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              No AI bot rules found in robots.txt
            </p>
          )}
        </>
      )}
    </div>
  );
}

function SitemapValidationCard({
  data,
}: {
  data?: {
    found: boolean;
    url?: string;
    valid: boolean;
    url_count?: number;
    errors: string[];
    has_lastmod: boolean;
    urls_in_sitemap_not_crawled: string[];
    crawled_not_in_sitemap: string[];
  };
}) {
  const found = data?.found ?? false;
  const valid = data?.valid ?? false;
  const hasErrors = (data?.errors?.length ?? 0) > 0;
  const urlCount = data?.url_count;
  const hasLastmod = data?.has_lastmod ?? false;
  const notCrawled = data?.urls_in_sitemap_not_crawled ?? [];
  const notInSitemap = data?.crawled_not_in_sitemap ?? [];

  let statusColor: string;
  let statusLabel: string;
  let StatusIcon: typeof IconCircleCheck;

  if (found && valid && !hasErrors) {
    statusColor = SCORE_COLORS.good;
    statusLabel = "Valid";
    StatusIcon = IconCircleCheck;
  } else if (found && hasErrors) {
    statusColor = SCORE_COLORS.warning;
    statusLabel = "Has Errors";
    StatusIcon = IconAlertTriangle;
  } else if (found && !valid) {
    statusColor = SCORE_COLORS.warning;
    statusLabel = "Invalid";
    StatusIcon = IconAlertTriangle;
  } else {
    statusColor = SCORE_COLORS.critical;
    statusLabel = "Not Found";
    StatusIcon = IconAlertCircle;
  }

  return (
    <div className="bg-[var(--color-surface-overlay)] rounded-xl p-5 flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="p-1.5 rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
          }}
        >
          <IconSitemap className="h-5 w-5" style={{ color: statusColor }} />
        </div>
        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Sitemap</h4>
        <StatusIcon className="h-4 w-4 ml-auto" style={{ color: statusColor }} />
      </div>

      <p className="text-xs font-medium mb-2" style={{ color: statusColor }}>
        {statusLabel}
      </p>

      {!found ? (
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          No sitemap was found. A valid XML sitemap helps AI crawlers discover and index your content efficiently.
        </p>
      ) : (
        <>
          {data?.url && (
            <p className="text-xs text-[var(--color-text-muted)] mb-2 font-mono break-all">{data.url}</p>
          )}

          <div className="space-y-1.5 mb-2">
            {urlCount !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">URLs in sitemap</span>
                <span className="text-[var(--color-text-secondary)] font-medium">{urlCount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">Last modified dates</span>
              <span style={{ color: hasLastmod ? SCORE_COLORS.good : SCORE_COLORS.warning }} className="font-medium text-xs">
                {hasLastmod ? "Present" : "Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">Crawled, not in sitemap</span>
              <span style={{ color: notInSitemap.length > 0 ? SCORE_COLORS.warning : SCORE_COLORS.good }} className="font-medium text-xs">
                {notInSitemap.length.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">In sitemap, not crawled</span>
              <span style={{ color: notCrawled.length > 0 ? SCORE_COLORS.warning : SCORE_COLORS.good }} className="font-medium text-xs">
                {notCrawled.length.toLocaleString()}
              </span>
            </div>
          </div>

          {hasErrors && data?.errors && (
            <div className="mt-2">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1 font-medium">Errors</p>
              <ul className="space-y-1">
                {data.errors.map((err, i) => (
                  <li key={i} className="text-xs text-[var(--color-score-warning)] flex gap-1.5">
                    <IconAlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(notCrawled.length > 0 || notInSitemap.length > 0) && (
            <div className="mt-auto pt-2 space-y-1">
              {notCrawled.length > 0 && (
                <CollapsibleSection title={`${notCrawled.length} in sitemap, not crawled`}>
                  <CappedUrlList urls={notCrawled} />
                </CollapsibleSection>
              )}
              {notInSitemap.length > 0 && (
                <CollapsibleSection title={`${notInSitemap.length} crawled, not in sitemap`}>
                  <CappedUrlList urls={notInSitemap} />
                </CollapsibleSection>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function GeoReadinessSection({ siteLevelData }: GeoReadinessSectionProps) {
  if (!siteLevelData) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconGlobe className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                GEO Readiness
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Generative Engine Optimization — AI Discoverability
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <IconInfoCircle className="h-10 w-10 text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              No site-level data available.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Run a new scan to analyze GEO readiness.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const score = calculateGeoScore(siteLevelData);
  const { label, icon, bgClass, textClass } = getScoreLabel(score);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-muted)] rounded-lg">
              <IconGlobe className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                GEO Readiness
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Generative Engine Optimization — AI Discoverability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ScoreRing score={score} size={56} />
            <div className={`flex items-center gap-1 px-3 py-1 ${bgClass} ${textClass} rounded-full text-sm font-medium`}>
              {icon}
              <span>{label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content — llms.txt full width (its file contents need room to wrap),
          the other two in a 2-column row. */}
      <div className="p-6 space-y-6">
        <LlmsTxtCard data={siteLevelData.llms_txt} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AiBotCrawlabilityCard data={siteLevelData.robots_txt} />
          <SitemapValidationCard data={siteLevelData.sitemap_validation} />
        </div>
      </div>
    </div>
  );
}
