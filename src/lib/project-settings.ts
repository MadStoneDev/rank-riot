// Per-project advanced configuration stored in projects.settings (JSONB).
// The crawler backend reads the same shape — keep key names in sync with
// crawl-rank-riot/src/utils/project-settings.ts.

export type WwwPreference = "auto" | "www" | "non-www";

export type CustomUrlType = "extra_sitemap" | "important_page";

export interface CustomUrlEntry {
  type: CustomUrlType;
  url: string;
}

export interface ProjectSettings {
  version: 1;
  crawl?: {
    sitemap_path?: string;
    exclude_patterns?: string[];
    www_preference?: Exclude<WwwPreference, "auto">;
    force_headless?: boolean;
  };
  pages?: {
    contact?: string;
    about?: string;
    blog?: string;
    services?: string;
    pricing?: string;
  };
  custom_urls?: CustomUrlEntry[];
}

export const KEY_PAGE_FIELDS = [
  { key: "contact", label: "Contact page", placeholder: "/contact" },
  { key: "about", label: "About page", placeholder: "/about" },
  { key: "blog", label: "Blog", placeholder: "/blog" },
  { key: "services", label: "Services page", placeholder: "/services" },
  { key: "pricing", label: "Pricing page", placeholder: "/pricing" },
] as const;

export type KeyPageKey = (typeof KEY_PAGE_FIELDS)[number]["key"];

const MAX_PATH_LENGTH = 300;
const MAX_EXCLUDE_PATTERNS = 50;
const MAX_CUSTOM_URLS = 20;

/**
 * True when `targetHost` is the same host as `baseHost`, or a subdomain of it,
 * ignoring a leading "www.". Pure host-suffix matching — safe for multi-label
 * TLDs like .com.au without needing a public-suffix list.
 */
export function isSameSite(targetHost: string, baseHost: string): boolean {
  const t = targetHost.toLowerCase();
  const b = baseHost.toLowerCase().replace(/^www\./, "");
  return t === b || t.endsWith(`.${b}`);
}

/** Extract a hostname from a project URL (which may omit the scheme). */
function hostOf(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname;
  } catch {
    return null;
  }
}

// Accepts a site-relative path ("/sitemap_pages.xml") or, when allowFullUrl is
// set, a full http(s) URL — but a full URL must point at the same site as the
// project (relative paths are always same-site). Returns null when invalid.
function sanitizePathOrUrl(
  value: unknown,
  allowFullUrl: boolean,
  baseHost: string | null,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_PATH_LENGTH || /\s/.test(trimmed)) {
    return null;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (!allowFullUrl) return null;
    try {
      const parsed = new URL(trimmed);
      // Reject cross-domain URLs. If we don't know the project host (baseHost
      // is null) we can't verify, so fail closed.
      if (!baseHost || !isSameSite(parsed.hostname, baseHost)) return null;
      return trimmed;
    } catch {
      return null;
    }
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * Validate untrusted form input into a clean ProjectSettings object.
 * Returns null when nothing meaningful was provided (store NULL, not {}).
 */
export function sanitizeProjectSettings(
  input: unknown,
  baseUrl?: string | null,
): ProjectSettings | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, any>;
  const result: ProjectSettings = { version: 1 };
  const baseHost = hostOf(baseUrl);

  const crawl: NonNullable<ProjectSettings["crawl"]> = {};
  const rawCrawl = raw.crawl && typeof raw.crawl === "object" ? raw.crawl : {};

  const sitemapPath = sanitizePathOrUrl(rawCrawl.sitemap_path, true, baseHost);
  // /sitemap.xml is the default — storing it would just be noise
  if (sitemapPath && sitemapPath !== "/sitemap.xml") {
    crawl.sitemap_path = sitemapPath;
  }

  if (Array.isArray(rawCrawl.exclude_patterns)) {
    const patterns = rawCrawl.exclude_patterns
      .map((p: unknown) => (typeof p === "string" ? p.trim() : ""))
      .filter((p: string) => p.length > 0 && p.length <= MAX_PATH_LENGTH)
      .slice(0, MAX_EXCLUDE_PATTERNS);
    if (patterns.length > 0) crawl.exclude_patterns = patterns;
  }

  if (rawCrawl.www_preference === "www" || rawCrawl.www_preference === "non-www") {
    crawl.www_preference = rawCrawl.www_preference;
  }

  if (rawCrawl.force_headless === true) {
    crawl.force_headless = true;
  }

  if (Object.keys(crawl).length > 0) result.crawl = crawl;

  const pages: NonNullable<ProjectSettings["pages"]> = {};
  const rawPages = raw.pages && typeof raw.pages === "object" ? raw.pages : {};
  for (const field of KEY_PAGE_FIELDS) {
    const path = sanitizePathOrUrl(rawPages[field.key], false, baseHost);
    if (path && path !== field.placeholder) {
      pages[field.key] = path;
    }
  }
  if (Object.keys(pages).length > 0) result.pages = pages;

  if (Array.isArray(raw.custom_urls)) {
    const entries: CustomUrlEntry[] = [];
    for (const entry of raw.custom_urls.slice(0, MAX_CUSTOM_URLS)) {
      if (!entry || typeof entry !== "object") continue;
      const type = (entry as Record<string, unknown>).type;
      if (type !== "extra_sitemap" && type !== "important_page") continue;
      const url = sanitizePathOrUrl(
        (entry as Record<string, unknown>).url,
        type === "extra_sitemap",
        baseHost,
      );
      if (!url) continue;
      entries.push({ type, url });
    }
    if (entries.length > 0) result.custom_urls = entries;
  }

  const hasContent = result.crawl || result.pages || result.custom_urls;
  return hasContent ? result : null;
}

/** Parse the settings JSON string submitted by the project forms. */
export function parseSettingsFormValue(
  value: unknown,
  baseUrl?: string | null,
): ProjectSettings | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return sanitizeProjectSettings(JSON.parse(value), baseUrl);
  } catch {
    return null;
  }
}
