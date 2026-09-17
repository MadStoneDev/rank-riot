import type { Severity } from "@/components/redesign/primitives";

// Compute the six fixed page-detail sections (Metadata · Headings · Images ·
// Links · Schema · Performance) from a crawled page. Each carries a severity, a
// one-line summary, and a label/value body. Clean sections state a fact
// ("6, all with alt text") — never a tick, never "Passed".

export type RowTone = "critical" | "warning" | "clean";

export interface SectionRow {
  label: string;
  value: string;
  tone: RowTone;
  mono?: boolean;
}

export interface Section {
  key: string;
  name: string;
  severity: Severity;
  summary: string;
  problemCount?: number;
  rows: SectionRow[];
}

export interface PageForSections {
  url: string;
  title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  has_robots_noindex: boolean | null;
  has_robots_nofollow: boolean | null;
  is_indexable: boolean | null;
  h1s: unknown;
  h2s: unknown;
  h3s: unknown;
  h4s: unknown;
  h5s: unknown;
  h6s: unknown;
  images: unknown;
  structured_data: unknown;
  schema_types: unknown;
  first_byte_time_ms: number | null;
  size_bytes: number | null;
  load_time_ms: number | null;
  http_status: number | null;
}

export interface LinkCounts {
  inbound: number;
  outbound: number;
  broken: number;
}

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const count = (v: unknown): number => asArray(v).length;

function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function rollUp(rows: SectionRow[], fallback: Severity): Severity {
  if (rows.some((r) => r.tone === "critical")) return "critical";
  if (rows.some((r) => r.tone === "warning")) return "warning";
  return fallback;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes / 1000)} KB`;
}

export function computeSections(
  page: PageForSections,
  links: LinkCounts,
): Section[] {
  const sections: Section[] = [];

  // ── Metadata ──
  {
    const rows: SectionRow[] = [];
    rows.push(
      page.title
        ? { label: "Title", value: page.title, tone: "clean" }
        : {
            label: "Title",
            value: "Missing — inherits the theme default",
            tone: "critical",
          },
    );
    rows.push(
      page.meta_description
        ? { label: "Meta description", value: page.meta_description, tone: "clean" }
        : { label: "Meta description", value: "Missing", tone: "critical" },
    );
    const canonicalMismatch =
      !!page.canonical_url &&
      normalizeUrl(page.canonical_url) !== normalizeUrl(page.url);
    rows.push({
      label: "Canonical",
      value: !page.canonical_url
        ? "self"
        : canonicalMismatch
          ? page.canonical_url
          : "self",
      tone: canonicalMismatch ? "warning" : "clean",
      mono: true,
    });
    const robots = `${page.has_robots_noindex ? "noindex" : "index"}, ${
      page.has_robots_nofollow ? "nofollow" : "follow"
    }`;
    rows.push({
      label: "Robots",
      value: robots,
      tone: page.has_robots_noindex ? "warning" : "clean",
      mono: true,
    });
    const problemCount = rows.filter((r) => r.tone !== "clean").length;
    const severity = rollUp(rows, "clean");
    const summary =
      severity === "clean"
        ? "Title and description set"
        : `${problemCount} ${problemCount === 1 ? "problem" : "problems"}`;
    sections.push({
      key: "metadata",
      name: "Metadata",
      severity,
      summary,
      problemCount: problemCount || undefined,
      rows,
    });
  }

  // ── Headings outline ──
  {
    const h1 = count(page.h1s);
    const h2 = count(page.h2s);
    const h3 = count(page.h3s);
    const h4 = count(page.h4s);
    const h5 = count(page.h5s);
    const h6 = count(page.h6s);
    // A skip is a deeper level present while the one above it is absent.
    const skip =
      (h3 > 0 && h2 === 0) ||
      (h4 > 0 && h3 === 0) ||
      (h5 > 0 && h4 === 0) ||
      (h6 > 0 && h5 === 0);
    const rows: SectionRow[] = [
      { label: "H1", value: String(h1), tone: h1 === 0 ? "warning" : "clean", mono: true },
      { label: "H2", value: String(h2), tone: "clean", mono: true },
      { label: "H3–H6", value: `${h3} · ${h4} · ${h5} · ${h6}`, tone: "clean", mono: true },
    ];
    if (skip) {
      rows.push({
        label: "Order",
        value: "Levels skip — the outline reads as one flat block",
        tone: "warning",
      });
    }
    const severity: Severity = h1 === 0 || skip ? "warning" : "clean";
    const parts: string[] = [];
    parts.push(h1 === 0 ? "No H1" : `${h1} H1`);
    parts.push(`${h2} H2`);
    if (skip) parts.push("levels out of order");
    sections.push({
      key: "headings",
      name: "Headings outline",
      severity,
      summary: parts.join(" · "),
      rows,
    });
  }

  // ── Images ──
  {
    const imgs = asArray(page.images) as { alt?: string }[];
    const total = imgs.length;
    const missingAlt = imgs.filter((i) => !i?.alt || i.alt.trim() === "").length;
    const severity: Severity = missingAlt > 0 ? "warning" : "clean";
    const summary =
      total === 0
        ? "No images"
        : missingAlt > 0
          ? `${total} total · ${missingAlt} missing alt`
          : `${total}, all with alt text`;
    const rows: SectionRow[] = [
      { label: "Total", value: String(total), tone: "clean", mono: true },
      {
        label: "Missing alt",
        value: String(missingAlt),
        tone: missingAlt > 0 ? "warning" : "clean",
        mono: true,
      },
    ];
    sections.push({ key: "images", name: "Images", severity, summary, rows });
  }

  // ── Links ──
  {
    const { inbound, outbound, broken } = links;
    const severity: Severity = broken > 0 ? "warning" : "clean";
    const rows: SectionRow[] = [
      { label: "Inbound", value: String(inbound), tone: "clean", mono: true },
      { label: "Outbound", value: String(outbound), tone: "clean", mono: true },
      {
        label: "Broken",
        value: String(broken),
        tone: broken > 0 ? "warning" : "clean",
        mono: true,
      },
    ];
    sections.push({
      key: "links",
      name: "Links",
      severity,
      summary: `${inbound} inbound · ${outbound} outbound · ${broken} broken`,
      rows,
    });
  }

  // ── Schema ──
  {
    const types = asArray(page.schema_types).filter(
      (t): t is string => typeof t === "string",
    );
    const hasData =
      types.length > 0 ||
      (Array.isArray(page.structured_data)
        ? page.structured_data.length > 0
        : !!page.structured_data &&
          Object.keys(page.structured_data as object).length > 0);
    const severity: Severity = hasData ? "clean" : "low";
    const summary = hasData
      ? types.length > 0
        ? types.join(", ")
        : "Structured data present"
      : "No structured data";
    const rows: SectionRow[] = [
      {
        label: "Types",
        value: types.length > 0 ? types.join(", ") : hasData ? "Present" : "None",
        tone: "clean",
        mono: true,
      },
    ];
    sections.push({ key: "schema", name: "Schema", severity, summary, rows });
  }

  // ── Performance ──
  {
    const ttfb = page.first_byte_time_ms ?? 0;
    const size = page.size_bytes ?? 0;
    const load = page.load_time_ms ?? 0;
    const slow = (ttfb > 0 && ttfb > 800) || (load > 0 && load > 3000);
    const heavy = size > 3_000_000;
    const severity: Severity = slow || heavy ? "warning" : "clean";
    const rows: SectionRow[] = [
      {
        label: "TTFB",
        value: ttfb > 0 ? `${ttfb} ms` : "—",
        tone: ttfb > 800 ? "warning" : "clean",
        mono: true,
      },
      {
        label: "Page size",
        value: size > 0 ? formatBytes(size) : "—",
        tone: heavy ? "warning" : "clean",
        mono: true,
      },
      {
        label: "Load time",
        value: load > 0 ? `${(load / 1000).toFixed(1)} s` : "—",
        tone: load > 3000 ? "warning" : "clean",
        mono: true,
      },
    ];
    const summaryParts: string[] = [];
    if (ttfb > 0) summaryParts.push(`${ttfb} ms TTFB`);
    if (size > 0) summaryParts.push(formatBytes(size));
    if (load > 0) summaryParts.push(`${(load / 1000).toFixed(1)} s load`);
    sections.push({
      key: "performance",
      name: "Performance",
      severity,
      summary: summaryParts.length ? summaryParts.join(" · ") : "Not measured",
      rows,
    });
  }

  return sections;
}
