export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

export interface ExportColumnDefinition extends ExportColumn {
  defaultSelected: boolean;
}

export interface ExportConfig {
  filename: string;
  columns: ExportColumn[];
}

export type ExportableData = Record<string, any>[];

export type ExportFormat = "csv" | "json" | "text" | "pdf" | "html";

export type ExportDataType =
  | "pages"
  | "seo-metadata"
  | "schema-data"
  | "images-alt"
  | "broken-links"
  | "redirects"
  | "headings"
  | "performance"
  | "internal-links"
  | "external-links"
  | "anchor-distribution"
  | "technical-health"
  | "issues"
  | "backlinks";

export interface ExportFilter {
  key: string;
  label: string;
  predicate: (row: Record<string, any>) => boolean;
}

// Backwards-compatible pre-configured columns
export const PAGES_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "url", header: "URL" },
  { key: "title", header: "Title" },
  { key: "meta_description", header: "Meta Description" },
  { key: "word_count", header: "Word Count" },
  { key: "http_status", header: "HTTP Status" },
  { key: "load_time_ms", header: "Load Time (ms)" },
  { key: "depth", header: "Depth" },
  { key: "is_indexable", header: "Indexable" },
];

export const ISSUES_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "page_url", header: "Page URL" },
  { key: "issue_type", header: "Issue Type" },
  { key: "severity", header: "Severity" },
  { key: "description", header: "Description" },
  { key: "created_at", header: "Created At" },
];

// --- New column configs for universal export ---

const pipeDelimitedFormatter = (value: any): string => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(" | ");
  return String(value);
};

const jsonFormatter = (value: any): string => {
  if (!value) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const booleanFormatter = (value: any): string => {
  if (value === null || value === undefined) return "";
  return value ? "Yes" : "No";
};

const dateFormatter = (value: any): string => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return String(value);
  }
};

/** Render a redirect chain (array of URLs) as "a -> b -> c". */
const chainFormatter = (value: any): string => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(" -> ");
  return String(value);
};

/** Number of hops in a redirect chain. */
const hopsFormatter = (value: any): string => {
  if (Array.isArray(value)) return String(value.length);
  return "";
};

export const PAGE_URLS_COLUMNS: ExportColumnDefinition[] = [
  { key: "url", header: "URL", defaultSelected: true },
  { key: "http_status", header: "HTTP Status", defaultSelected: true },
  { key: "is_indexable", header: "Indexable", defaultSelected: true, formatter: booleanFormatter },
  { key: "depth", header: "Crawl Depth", defaultSelected: true },
  { key: "scan_method", header: "Render Method", defaultSelected: true },
  { key: "schema_source", header: "Schema Source", defaultSelected: true },
  { key: "inlink_count", header: "Inlinks", defaultSelected: true },
  { key: "unique_inlink_count", header: "Unique Inlinks", defaultSelected: true },
  { key: "outlink_count", header: "Outlinks", defaultSelected: true },
  { key: "unique_outlink_count", header: "Unique Outlinks", defaultSelected: false },
  { key: "has_mixed_content", header: "Mixed Content", defaultSelected: true, formatter: booleanFormatter },
  { key: "security_headers", header: "Security Headers", defaultSelected: false, formatter: jsonFormatter },
  { key: "canonical_url", header: "Canonical URL", defaultSelected: true },
  // Normalised (trailing-slash/host/case-insensitive) self-canonical flag, so
  // consumers don't read a raw canonical_url != url trailing-slash diff as a
  // mismatch. This is the same truth the issues/technical-health side uses.
  { key: "canonical_is_self", header: "Canonical Matches URL", defaultSelected: true, formatter: booleanFormatter },
];

export const SEO_METADATA_COLUMNS: ExportColumnDefinition[] = [
  { key: "url", header: "URL", defaultSelected: true },
  { key: "title", header: "Title", defaultSelected: true },
  { key: "title_length", header: "Title Length", defaultSelected: true },
  { key: "meta_description", header: "Meta Description", defaultSelected: true },
  { key: "meta_description_length", header: "Meta Description Length", defaultSelected: true },
  { key: "h1s", header: "H1s", defaultSelected: true, formatter: pipeDelimitedFormatter },
  { key: "canonical_url", header: "Canonical URL", defaultSelected: false },
  { key: "has_robots_noindex", header: "NoIndex", defaultSelected: true, formatter: booleanFormatter },
  { key: "has_robots_nofollow", header: "NoFollow", defaultSelected: false, formatter: booleanFormatter },
];

export const SCHEMA_DATA_COLUMNS: ExportColumnDefinition[] = [
  { key: "url", header: "URL", defaultSelected: true },
  { key: "schema_types", header: "Schema Types", defaultSelected: true, formatter: pipeDelimitedFormatter },
  { key: "structured_data", header: "Structured Data", defaultSelected: true, formatter: jsonFormatter },
  { key: "open_graph", header: "Open Graph", defaultSelected: true, formatter: jsonFormatter },
  { key: "twitter_card", header: "Twitter Card", defaultSelected: true, formatter: jsonFormatter },
];

export const IMAGES_ALT_COLUMNS: ExportColumnDefinition[] = [
  { key: "pageUrl", header: "Page URL", defaultSelected: true },
  { key: "imageSrc", header: "Image Source", defaultSelected: true },
  { key: "alt", header: "Alt Text", defaultSelected: true },
  { key: "hasAlt", header: "Has Alt", defaultSelected: true, formatter: booleanFormatter },
  { key: "altQuality", header: "Alt Quality", defaultSelected: true },
  { key: "width", header: "Width", defaultSelected: false },
  { key: "height", header: "Height", defaultSelected: false },
  { key: "missingDimensions", header: "Missing Dimensions (CLS risk)", defaultSelected: true, formatter: booleanFormatter },
  { key: "fileSizeBytes", header: "File Size (bytes)", defaultSelected: true },
  { key: "format", header: "Format", defaultSelected: false },
  { key: "loading", header: "Loading", defaultSelected: false },
  { key: "pageTitle", header: "Page Title", defaultSelected: false },
];

export const BROKEN_LINKS_COLUMNS: ExportColumnDefinition[] = [
  { key: "source_url", header: "Source URL", defaultSelected: true },
  { key: "destination_url", header: "Destination URL", defaultSelected: true },
  { key: "http_status", header: "HTTP Status", defaultSelected: true },
  { key: "anchor_text", header: "Anchor Text", defaultSelected: true },
  { key: "source_title", header: "Source Title", defaultSelected: false },
];

export const REDIRECTS_COLUMNS: ExportColumnDefinition[] = [
  { key: "url", header: "Source URL", defaultSelected: true },
  { key: "http_status", header: "Status", defaultSelected: true },
  { key: "redirect_url", header: "Redirects To", defaultSelected: true },
  { key: "redirect_chain", header: "Hops", defaultSelected: true, formatter: hopsFormatter },
  { key: "redirect_chain", header: "Chain", defaultSelected: true, formatter: chainFormatter },
];

export const HEADINGS_COLUMNS: ExportColumnDefinition[] = [
  { key: "url", header: "URL", defaultSelected: true },
  { key: "title", header: "Title", defaultSelected: true },
  { key: "h1s", header: "H1s", defaultSelected: true, formatter: pipeDelimitedFormatter },
  { key: "h2s", header: "H2s", defaultSelected: true, formatter: pipeDelimitedFormatter },
  { key: "h3s", header: "H3s", defaultSelected: true, formatter: pipeDelimitedFormatter },
  { key: "h4s", header: "H4s", defaultSelected: false, formatter: pipeDelimitedFormatter },
  { key: "h5s", header: "H5s", defaultSelected: false, formatter: pipeDelimitedFormatter },
  { key: "h6s", header: "H6s", defaultSelected: false, formatter: pipeDelimitedFormatter },
];

export const PERFORMANCE_COLUMNS: ExportColumnDefinition[] = [
  { key: "url", header: "URL", defaultSelected: true },
  { key: "load_time_ms", header: "Load Time (ms)", defaultSelected: true },
  { key: "first_byte_time_ms", header: "First Byte Time (ms)", defaultSelected: true },
  { key: "size_bytes", header: "Size (bytes)", defaultSelected: true },
  { key: "image_total_bytes", header: "Image Weight (bytes)", defaultSelected: true },
  { key: "image_compressible_bytes", header: "Compressible (bytes)", defaultSelected: true },
  { key: "word_count", header: "Word Count", defaultSelected: true },
  { key: "js_count", header: "JS Files", defaultSelected: true },
  { key: "css_count", header: "CSS Files", defaultSelected: true },
];

export const INTERNAL_LINKS_COLUMNS: ExportColumnDefinition[] = [
  { key: "source_url", header: "Source URL", defaultSelected: true },
  { key: "destination_url", header: "Destination URL", defaultSelected: true },
  { key: "anchor_text", header: "Anchor Text", defaultSelected: true },
  { key: "is_followed", header: "Followed", defaultSelected: true, formatter: booleanFormatter },
  { key: "http_status", header: "HTTP Status", defaultSelected: false },
];

export const EXTERNAL_LINKS_COLUMNS: ExportColumnDefinition[] = [
  { key: "source_url", header: "Source URL", defaultSelected: true },
  { key: "destination_url", header: "Destination URL", defaultSelected: true },
  { key: "anchor_text", header: "Anchor Text", defaultSelected: true },
  { key: "is_followed", header: "Followed", defaultSelected: true, formatter: booleanFormatter },
  { key: "rel_attributes", header: "Rel Attributes", defaultSelected: false, formatter: jsonFormatter },
];

export const ANCHOR_DISTRIBUTION_COLUMNS: ExportColumnDefinition[] = [
  { key: "destination_url", header: "Destination URL", defaultSelected: true },
  { key: "anchor_text", header: "Anchor Text", defaultSelected: true },
  { key: "count", header: "Links", defaultSelected: true },
];

export const TECHNICAL_HEALTH_COLUMNS: ExportColumnDefinition[] = [
  { key: "url", header: "URL", defaultSelected: true },
  { key: "scan_method", header: "Render Method", defaultSelected: true },
  { key: "schema_source", header: "Schema Source", defaultSelected: true },
  { key: "detected_platform", header: "Detected Platform", defaultSelected: true },
  { key: "js_rendering_gap", header: "JS Content Gap", defaultSelected: true, formatter: jsonFormatter },
  { key: "security_headers", header: "Security Headers", defaultSelected: true, formatter: jsonFormatter },
  { key: "has_mixed_content", header: "Mixed Content", defaultSelected: true, formatter: booleanFormatter },
  { key: "has_viewport_meta", header: "Viewport Meta", defaultSelected: true, formatter: booleanFormatter },
  { key: "heading_hierarchy_valid", header: "Heading Hierarchy Valid", defaultSelected: true, formatter: booleanFormatter },
  { key: "heading_hierarchy_issues", header: "Heading Hierarchy Issues", defaultSelected: false, formatter: pipeDelimitedFormatter },
  { key: "readability_score", header: "Readability Score", defaultSelected: true },
  { key: "canonical_is_self", header: "Canonical Is Self", defaultSelected: true, formatter: booleanFormatter },
  { key: "hreflang_tags", header: "Hreflang Tags", defaultSelected: false, formatter: jsonFormatter },
  { key: "url_issues", header: "URL Issues", defaultSelected: false, formatter: pipeDelimitedFormatter },
];

export const ISSUES_FULL_COLUMNS: ExportColumnDefinition[] = [
  { key: "page_url", header: "Page URL", defaultSelected: true },
  { key: "issue_type", header: "Issue Type", defaultSelected: true },
  { key: "severity", header: "Severity", defaultSelected: true },
  { key: "description", header: "Description", defaultSelected: true },
  { key: "details", header: "Details", defaultSelected: false, formatter: jsonFormatter },
  { key: "created_at", header: "Created At", defaultSelected: true, formatter: dateFormatter },
  { key: "is_fixed", header: "Fixed", defaultSelected: false, formatter: booleanFormatter },
];

export const BACKLINKS_COLUMNS: ExportColumnDefinition[] = [
  { key: "source_url", header: "Source URL", defaultSelected: true },
  { key: "source_domain", header: "Source Domain", defaultSelected: true },
  { key: "anchor_text", header: "Anchor Text", defaultSelected: true },
  { key: "is_followed", header: "Followed", defaultSelected: true, formatter: booleanFormatter },
  { key: "target_page_url", header: "Target Page", defaultSelected: true },
  { key: "first_seen_at", header: "First Seen", defaultSelected: false, formatter: dateFormatter },
  { key: "last_seen_at", header: "Last Seen", defaultSelected: true, formatter: dateFormatter },
];

// Registry: map data type to its column config
export const EXPORT_COLUMN_REGISTRY: Record<ExportDataType, ExportColumnDefinition[]> = {
  "pages": PAGE_URLS_COLUMNS,
  "seo-metadata": SEO_METADATA_COLUMNS,
  "schema-data": SCHEMA_DATA_COLUMNS,
  "images-alt": IMAGES_ALT_COLUMNS,
  "broken-links": BROKEN_LINKS_COLUMNS,
  "redirects": REDIRECTS_COLUMNS,
  "headings": HEADINGS_COLUMNS,
  "performance": PERFORMANCE_COLUMNS,
  "internal-links": INTERNAL_LINKS_COLUMNS,
  "external-links": EXTERNAL_LINKS_COLUMNS,
  "anchor-distribution": ANCHOR_DISTRIBUTION_COLUMNS,
  "technical-health": TECHNICAL_HEALTH_COLUMNS,
  "issues": ISSUES_FULL_COLUMNS,
  "backlinks": BACKLINKS_COLUMNS,
};

// Filters per data type
export const EXPORT_FILTERS: Record<ExportDataType, ExportFilter[]> = {
  "pages": [
    { key: "all", label: "All Pages", predicate: () => true },
    { key: "indexable", label: "Indexable Only", predicate: (r) => r.is_indexable !== false },
    { key: "non-indexable", label: "Non-Indexable Only", predicate: (r) => r.is_indexable === false },
    { key: "errors", label: "HTTP Errors (4xx/5xx)", predicate: (r) => r.http_status >= 400 },
    { key: "redirects", label: "Redirects (3xx)", predicate: (r) => r.http_status >= 300 && r.http_status < 400 },
  ],
  "seo-metadata": [
    { key: "all", label: "All Pages", predicate: () => true },
    { key: "missing-title", label: "Missing Title", predicate: (r) => !r.title },
    { key: "missing-meta", label: "Missing Meta Description", predicate: (r) => !r.meta_description },
    { key: "noindex", label: "NoIndex Pages", predicate: (r) => r.has_robots_noindex === true },
  ],
  "schema-data": [
    { key: "all", label: "All Pages", predicate: () => true },
    { key: "has-schema", label: "Has Schema", predicate: (r) => r.schema_types && (Array.isArray(r.schema_types) ? r.schema_types.length > 0 : true) },
    { key: "no-schema", label: "No Schema", predicate: (r) => !r.schema_types || (Array.isArray(r.schema_types) && r.schema_types.length === 0) },
    { key: "has-og", label: "Has Open Graph", predicate: (r) => r.open_graph && Object.keys(r.open_graph).length > 0 },
  ],
  "images-alt": [
    { key: "all", label: "All Images", predicate: () => true },
    { key: "missing-alt", label: "Missing Alt Text", predicate: (r) => !r.hasAlt },
    { key: "has-alt", label: "Has Alt Text", predicate: (r) => r.hasAlt === true },
  ],
  "broken-links": [
    { key: "all", label: "All Broken Links", predicate: () => true },
    { key: "404", label: "404 Not Found", predicate: (r) => r.http_status === 404 },
    { key: "5xx", label: "Server Errors (5xx)", predicate: (r) => r.http_status >= 500 },
  ],
  "redirects": [
    { key: "all", label: "All Redirects", predicate: () => true },
    { key: "chains", label: "Redirect Chains (2+ hops)", predicate: (r) => Array.isArray(r.redirect_chain) && r.redirect_chain.length >= 2 },
    { key: "permanent", label: "Permanent (301/308)", predicate: (r) => r.http_status === 301 || r.http_status === 308 },
    { key: "temporary", label: "Temporary (302/307)", predicate: (r) => r.http_status === 302 || r.http_status === 307 },
  ],
  "headings": [
    { key: "all", label: "All Pages", predicate: () => true },
    { key: "missing-h1", label: "Missing H1", predicate: (r) => !r.h1s || (Array.isArray(r.h1s) && r.h1s.length === 0) },
    { key: "multiple-h1", label: "Multiple H1s", predicate: (r) => Array.isArray(r.h1s) && r.h1s.length > 1 },
  ],
  "performance": [
    { key: "all", label: "All Pages", predicate: () => true },
    { key: "slow", label: "Slow (>3s)", predicate: (r) => r.load_time_ms > 3000 },
    { key: "large", label: "Large (>1MB)", predicate: (r) => r.size_bytes > 1048576 },
  ],
  "internal-links": [
    { key: "all", label: "All Internal Links", predicate: () => true },
    { key: "followed", label: "Followed Only", predicate: (r) => r.is_followed !== false },
    { key: "nofollowed", label: "NoFollowed Only", predicate: (r) => r.is_followed === false },
  ],
  "external-links": [
    { key: "all", label: "All External Links", predicate: () => true },
    { key: "followed", label: "Followed Only", predicate: (r) => r.is_followed !== false },
    { key: "nofollowed", label: "NoFollowed Only", predicate: (r) => r.is_followed === false },
  ],
  "anchor-distribution": [
    { key: "all", label: "All Anchors", predicate: () => true },
    { key: "empty", label: "Empty Anchors", predicate: (r) => r.anchor_text === "(empty)" },
    { key: "repeated", label: "Repeated (2+)", predicate: (r) => r.count >= 2 },
  ],
  "technical-health": [
    { key: "all", label: "All Pages", predicate: () => true },
    { key: "mixed-content", label: "Has Mixed Content", predicate: (r) => r.has_mixed_content === true },
    { key: "no-viewport", label: "Missing Viewport", predicate: (r) => r.has_viewport_meta === false },
    { key: "bad-headings", label: "Invalid Heading Hierarchy", predicate: (r) => r.heading_hierarchy_valid === false },
  ],
  "issues": [
    { key: "all", label: "All Issues", predicate: () => true },
    { key: "critical", label: "Critical", predicate: (r) => r.severity === "critical" },
    { key: "high", label: "High", predicate: (r) => r.severity === "high" },
    { key: "medium", label: "Medium", predicate: (r) => r.severity === "medium" },
    { key: "low", label: "Low", predicate: (r) => r.severity === "low" },
  ],
  "backlinks": [
    { key: "all", label: "All Backlinks", predicate: () => true },
    { key: "followed", label: "Followed Only", predicate: (r) => r.is_followed !== false },
    { key: "nofollowed", label: "NoFollowed Only", predicate: (r) => r.is_followed === false },
  ],
};

// Human-readable labels for data types
export const EXPORT_DATA_TYPE_LABELS: Record<ExportDataType, string> = {
  "pages": "Page URLs",
  "seo-metadata": "SEO Metadata",
  "schema-data": "Schema & Structured Data",
  "images-alt": "Images & Alt Text",
  "broken-links": "Broken Links",
  "redirects": "Redirects",
  "headings": "Headings Structure",
  "performance": "Performance Metrics",
  "internal-links": "Internal Links",
  "external-links": "External Links",
  "anchor-distribution": "Anchor Distribution",
  "technical-health": "Technical Health",
  "issues": "Issues",
  "backlinks": "Backlinks",
};
