"use client";

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";

interface SEOIssue {
  type: "critical" | "warning" | "passed";
  message: string;
}

interface SEOHealthScoreProps {
  page: {
    title?: string | null;
    meta_description?: string | null;
    h1s?: any[] | null;
    h2s?: any[] | null;
    canonical_url?: string | null;
    url: string;
    has_robots_noindex?: boolean | null;
    is_indexable?: boolean | null;
    http_status?: number | null;
    images?: { src: string; alt: string }[] | null;
    open_graph?: any | null;
    twitter_card?: any | null;
    structured_data?: any | null;
  };
}

function calculateSEOScore(page: SEOHealthScoreProps["page"]): {
  score: number;
  issues: SEOIssue[];
} {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Title checks (20 points)
  if (!page.title) {
    issues.push({ type: "critical", message: "Missing page title" });
    score -= 20;
  } else {
    const titleLength = page.title.length;
    if (titleLength < 30) {
      issues.push({ type: "critical", message: "Title is too short (< 30 chars)" });
      score -= 15;
    } else if (titleLength > 70) {
      issues.push({ type: "warning", message: "Title is too long (> 70 chars)" });
      score -= 5;
    } else if (titleLength >= 50 && titleLength <= 60) {
      issues.push({ type: "passed", message: "Title length is optimal" });
    } else {
      issues.push({ type: "passed", message: "Title is present" });
    }
  }

  // Meta description checks (15 points)
  if (!page.meta_description) {
    issues.push({ type: "critical", message: "Missing meta description" });
    score -= 15;
  } else {
    const descLength = page.meta_description.length;
    if (descLength < 70) {
      issues.push({ type: "critical", message: "Meta description is too short (< 70 chars)" });
      score -= 10;
    } else if (descLength > 165) {
      issues.push({ type: "warning", message: "Meta description is too long (> 165 chars)" });
      score -= 5;
    } else if (descLength >= 120 && descLength <= 155) {
      issues.push({ type: "passed", message: "Meta description length is optimal" });
    } else {
      issues.push({ type: "passed", message: "Meta description is present" });
    }
  }

  // H1 checks (15 points)
  const h1Count = Array.isArray(page.h1s) ? page.h1s.length : 0;
  if (h1Count === 0) {
    issues.push({ type: "critical", message: "Missing H1 heading" });
    score -= 15;
  } else if (h1Count > 1) {
    issues.push({ type: "warning", message: `Multiple H1 headings (${h1Count})` });
    score -= 5;
  } else {
    issues.push({ type: "passed", message: "Single H1 heading present" });
  }

  // H2 checks (5 points)
  const h2Count = Array.isArray(page.h2s) ? page.h2s.length : 0;
  if (h2Count === 0) {
    issues.push({ type: "warning", message: "No H2 headings found" });
    score -= 5;
  } else {
    issues.push({ type: "passed", message: `${h2Count} H2 heading(s) present` });
  }

  // Indexability checks (15 points)
  if (page.has_robots_noindex) {
    issues.push({ type: "warning", message: "Page is set to noindex" });
    score -= 10;
  } else if (page.is_indexable === false) {
    issues.push({ type: "warning", message: "Page is not indexable" });
    score -= 10;
  } else {
    issues.push({ type: "passed", message: "Page is indexable" });
  }

  // Canonical URL check (10 points)
  if (page.canonical_url) {
    const normalizeUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (normalizeUrl(page.canonical_url) !== normalizeUrl(page.url)) {
      issues.push({ type: "warning", message: "Canonical URL differs from page URL" });
      score -= 5;
    } else {
      issues.push({ type: "passed", message: "Canonical URL matches page URL" });
    }
  }

  // HTTP Status check (10 points)
  if (page.http_status && page.http_status >= 400) {
    issues.push({ type: "critical", message: `HTTP status error (${page.http_status})` });
    score -= 10;
  } else if (page.http_status && page.http_status >= 300) {
    issues.push({ type: "warning", message: `Page redirects (${page.http_status})` });
    score -= 5;
  } else if (page.http_status === 200) {
    issues.push({ type: "passed", message: "HTTP status OK (200)" });
  }

  // Image alt text check (5 points)
  const images = Array.isArray(page.images) ? page.images : [];
  const missingAlt = images.filter((img) => !img.alt || img.alt.trim() === "").length;
  if (images.length > 0) {
    if (missingAlt > 0) {
      issues.push({ type: "warning", message: `${missingAlt} image(s) missing alt text` });
      score -= Math.min(5, missingAlt);
    } else {
      issues.push({ type: "passed", message: "All images have alt text" });
    }
  }

  // Open Graph check (5 points)
  if (page.open_graph && Object.keys(page.open_graph).length > 0) {
    issues.push({ type: "passed", message: "Open Graph tags present" });
  } else {
    issues.push({ type: "warning", message: "Missing Open Graph tags" });
    score -= 3;
  }

  // Twitter Card check
  if (page.twitter_card && Object.keys(page.twitter_card).length > 0) {
    issues.push({ type: "passed", message: "Twitter Card tags present" });
  }

  // Structured data check
  if (page.structured_data && (Array.isArray(page.structured_data) ? page.structured_data.length > 0 : Object.keys(page.structured_data).length > 0)) {
    issues.push({ type: "passed", message: "Structured data present" });
  }

  return { score: Math.max(0, score), issues };
}

export default function SEOHealthScore({ page }: SEOHealthScoreProps) {
  const { score, issues } = calculateSEOScore(page);

  const critical = issues.filter((i) => i.type === "critical").length;
  const warnings = issues.filter((i) => i.type === "warning").length;
  const passed = issues.filter((i) => i.type === "passed").length;

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-600";
  };

  const getScoreBgColor = () => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-orange-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-16 h-16 rounded-full ${getScoreBgColor()}`}
          >
            <span className={`text-2xl font-bold ${getScoreColor()}`}>
              {score}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              SEO Health Score
            </h2>
            <p className="text-sm text-neutral-500">
              {score >= 80
                ? "Great job! Your page is well optimized."
                : score >= 60
                  ? "Good, but there's room for improvement."
                  : "Needs attention. Several issues found."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {critical > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              <IconAlertCircle className="h-4 w-4" />
              <span>{critical} Critical</span>
            </div>
          )}
          {warnings > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
              <IconAlertTriangle className="h-4 w-4" />
              <span>{warnings} Warning{warnings !== 1 ? "s" : ""}</span>
            </div>
          )}
          {passed > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <IconCircleCheck className="h-4 w-4" />
              <span>{passed} Passed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { calculateSEOScore };
export type { SEOIssue };
