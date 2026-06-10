"use client";

import { useMemo, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  CustomUrlEntry,
  CustomUrlType,
  isSameSite,
  KEY_PAGE_FIELDS,
  KeyPageKey,
  ProjectSettings,
  WwwPreference,
} from "@/lib/project-settings";

interface AdvancedSettingsFieldsProps {
  initialSettings?: ProjectSettings | null;
  baseUrl?: string;
  disabled?: boolean;
}

// Warn when a value is a full URL pointing at a different domain than the
// project — the server drops these, so flag them before the user saves.
function crossDomainWarning(
  value: string,
  baseUrl: string | undefined,
): string | null {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed) || !baseUrl) return null;
  try {
    const targetHost = new URL(trimmed).hostname;
    const baseHost = new URL(
      baseUrl.includes("://") ? baseUrl : `https://${baseUrl}`,
    ).hostname;
    if (!isSameSite(targetHost, baseHost)) {
      return `Must be on ${baseHost} — full URLs on other domains are ignored. Use a relative path like /sitemap.xml.`;
    }
  } catch {
    return null;
  }
  return null;
}

const inputClasses =
  "p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-md";

const labelClasses =
  "block text-sm font-medium text-[var(--color-text-secondary)]";

const hintClasses = "mt-1 text-xs text-[var(--color-text-muted)]";

/**
 * Advanced per-project crawl configuration. Keeps its own state and exposes
 * the result to the surrounding <form> via a hidden "settings" input, so it
 * works with plain FormData submission in both create and edit forms.
 */
export default function AdvancedSettingsFields({
  initialSettings,
  baseUrl,
  disabled = false,
}: AdvancedSettingsFieldsProps) {
  const [sitemapPath, setSitemapPath] = useState(
    initialSettings?.crawl?.sitemap_path ?? "",
  );
  const [keyPages, setKeyPages] = useState<Record<KeyPageKey, string>>(() => {
    const pages = {} as Record<KeyPageKey, string>;
    for (const field of KEY_PAGE_FIELDS) {
      pages[field.key] = initialSettings?.pages?.[field.key] ?? "";
    }
    return pages;
  });
  const [excludePatterns, setExcludePatterns] = useState(
    (initialSettings?.crawl?.exclude_patterns ?? []).join("\n"),
  );
  const [wwwPreference, setWwwPreference] = useState<WwwPreference>(
    initialSettings?.crawl?.www_preference ?? "auto",
  );
  const [forceHeadless, setForceHeadless] = useState(
    initialSettings?.crawl?.force_headless ?? false,
  );
  const [customUrls, setCustomUrls] = useState<CustomUrlEntry[]>(
    initialSettings?.custom_urls ?? [],
  );

  const settingsJson = useMemo(() => {
    const settings = {
      version: 1,
      crawl: {
        sitemap_path: sitemapPath,
        exclude_patterns: excludePatterns
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
        www_preference: wwwPreference === "auto" ? undefined : wwwPreference,
        force_headless: forceHeadless || undefined,
      },
      pages: keyPages,
      custom_urls: customUrls.filter((entry) => entry.url.trim()),
    };
    return JSON.stringify(settings);
  }, [sitemapPath, keyPages, excludePatterns, wwwPreference, forceHeadless, customUrls]);

  const updateCustomUrl = (
    index: number,
    patch: Partial<CustomUrlEntry>,
  ) => {
    setCustomUrls((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <input type="hidden" name="settings" value={settingsJson} />

      <div className="sm:col-span-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Only fill these in when our defaults don&apos;t match your site.
          Everything here is optional — we auto-detect sitemaps, key pages and
          domain format on most sites.
        </p>
      </div>

      {/* Sitemap */}
      <div className="sm:col-span-3">
        <label htmlFor="adv-sitemap" className={labelClasses}>
          Pages Sitemap
        </label>
        <div className="mt-1">
          <input
            id="adv-sitemap"
            type="text"
            value={sitemapPath}
            onChange={(e) => setSitemapPath(e.target.value)}
            placeholder="/sitemap.xml"
            className={inputClasses}
            disabled={disabled}
          />
        </div>
        {crossDomainWarning(sitemapPath, baseUrl) ? (
          <p className="mt-1 text-xs text-[var(--color-score-critical)]">
            {crossDomainWarning(sitemapPath, baseUrl)}
          </p>
        ) : (
          <p className={hintClasses}>
            Your main pages sitemap only — add product or category sitemaps
            under &quot;More custom info&quot; below. Shopify, BigCommerce and
            WordPress stores often use a non-standard path.
          </p>
        )}
      </div>

      {/* www preference */}
      <div className="sm:col-span-3">
        <label htmlFor="adv-www" className={labelClasses}>
          Domain Format
        </label>
        <div className="mt-1">
          <select
            id="adv-www"
            value={wwwPreference}
            onChange={(e) => setWwwPreference(e.target.value as WwwPreference)}
            className={inputClasses}
            disabled={disabled}
          >
            <option value="auto">Auto-detect (recommended)</option>
            <option value="www">Always www (www.example.com)</option>
            <option value="non-www">Always non-www (example.com)</option>
          </select>
        </div>
        <p className={hintClasses}>
          Force the canonical domain format if auto-detection picks the wrong
          one.
        </p>
      </div>

      {/* Key pages */}
      <div className="sm:col-span-6">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Key Pages
        </h4>
        <p className={hintClasses}>
          Tell us where your important pages live if they use custom URLs —
          e.g. a contact page at /launch-your-vision. This improves audit
          accuracy and guarantees these pages get crawled.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {KEY_PAGE_FIELDS.map((field) => (
            <div key={field.key}>
              <label htmlFor={`adv-page-${field.key}`} className={labelClasses}>
                {field.label}
              </label>
              <div className="mt-1">
                <input
                  id={`adv-page-${field.key}`}
                  type="text"
                  value={keyPages[field.key]}
                  onChange={(e) =>
                    setKeyPages((pages) => ({
                      ...pages,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className={inputClasses}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exclude patterns */}
      <div className="sm:col-span-6">
        <label htmlFor="adv-exclude" className={labelClasses}>
          Excluded Paths
        </label>
        <div className="mt-1">
          <textarea
            id="adv-exclude"
            rows={3}
            value={excludePatterns}
            onChange={(e) => setExcludePatterns(e.target.value)}
            placeholder={"/cart\n/staging\n/members"}
            className={inputClasses}
            disabled={disabled}
          />
        </div>
        <p className={hintClasses}>
          One per line. URLs containing these paths are skipped during crawls.
        </p>
      </div>

      {/* Force headless */}
      <div className="sm:col-span-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={forceHeadless}
            onChange={(e) => setForceHeadless(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[var(--color-border-default)] text-secondary focus:ring-primary"
            disabled={disabled}
          />
          <span>
            <span className="block text-sm font-medium text-[var(--color-text-primary)]">
              Always render JavaScript
            </span>
            <span className="block text-xs text-[var(--color-text-muted)]">
              Use a full browser for every page. Slower, but required for
              sites that render all content with JavaScript. We normally
              detect this automatically.
            </span>
          </span>
        </label>
      </div>

      {/* More custom info */}
      <div className="sm:col-span-6">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
          More Custom Info
        </h4>
        <p className={hintClasses}>
          Extra sitemaps to read, or important pages we should always crawl
          even if they aren&apos;t linked from anywhere.
        </p>
        <div className="mt-3 space-y-3">
          {customUrls.map((entry, index) => {
          const rowWarning =
            entry.type === "extra_sitemap"
              ? crossDomainWarning(entry.url, baseUrl)
              : null;
          return (
            <div key={index}>
            <div className="flex items-center gap-3">
              <select
                value={entry.type}
                onChange={(e) =>
                  updateCustomUrl(index, {
                    type: e.target.value as CustomUrlType,
                  })
                }
                className={`${inputClasses} w-44 flex-shrink-0`}
                disabled={disabled}
                aria-label="Info type"
              >
                <option value="extra_sitemap">Extra sitemap</option>
                <option value="important_page">Important page</option>
              </select>
              <input
                type="text"
                value={entry.url}
                onChange={(e) => updateCustomUrl(index, { url: e.target.value })}
                placeholder={
                  entry.type === "extra_sitemap"
                    ? "/sitemap_products_1.xml"
                    : "/special-landing-page"
                }
                className={inputClasses}
                disabled={disabled}
                aria-label="URL or path"
              />
              <button
                type="button"
                onClick={() =>
                  setCustomUrls((entries) =>
                    entries.filter((_, i) => i !== index),
                  )
                }
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-score-critical)] transition-colors"
                disabled={disabled}
                aria-label="Remove"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
            {rowWarning && (
              <p className="mt-1 text-xs text-[var(--color-score-critical)]">
                {rowWarning}
              </p>
            )}
            </div>
          );
          })}
          <button
            type="button"
            onClick={() =>
              setCustomUrls((entries) =>
                entries.length >= 20
                  ? entries
                  : [...entries, { type: "extra_sitemap", url: "" }],
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--color-border-default)] rounded-md text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)]"
            disabled={disabled}
          >
            <IconPlus className="w-4 h-4" />
            Add info
          </button>
        </div>
      </div>
    </div>
  );
}
