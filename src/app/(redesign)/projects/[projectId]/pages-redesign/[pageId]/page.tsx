import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getPageScore } from "@/utils/page-score";
import {
  computeSections,
  type PageForSections,
} from "@/lib/page-detail-sections";
import {
  DisclosureSection,
  DetailRow,
} from "@/components/redesign/DisclosureSection";

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

export default async function PageDetailRedesign({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId, pageId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) notFound();

  const { data: page } = await supabase
    .from("pages")
    .select(
      "id, url, title, meta_description, canonical_url, has_robots_noindex, has_robots_nofollow, is_indexable, http_status, h1s, h2s, h3s, h4s, h5s, h6s, word_count, images, open_graph, twitter_card, structured_data, schema_types, first_byte_time_ms, size_bytes, load_time_ms, inlink_count",
    )
    .eq("id", pageId)
    .eq("project_id", projectId)
    .single();
  if (!page) notFound();

  const { data: outLinks } = await supabase
    .from("page_links")
    .select("is_broken")
    .eq("project_id", projectId)
    .eq("source_page_id", pageId);

  const outbound = outLinks?.length ?? 0;
  const broken = (outLinks ?? []).filter((l) => l.is_broken === true).length;
  const inbound = page.inlink_count ?? 0;

  const score = getPageScore({
    url: page.url,
    title: page.title,
    meta_description: page.meta_description,
    h1s: page.h1s as unknown[] | null,
    h2s: page.h2s as unknown[] | null,
    word_count: page.word_count,
    canonical_url: page.canonical_url,
    has_robots_noindex: page.has_robots_noindex,
    is_indexable: page.is_indexable,
    http_status: page.http_status,
    images: page.images as { src: string; alt: string }[] | null,
    open_graph: page.open_graph as Record<string, unknown> | null,
    twitter_card: page.twitter_card as Record<string, unknown> | null,
    structured_data: page.structured_data,
  });

  const sections = computeSections(page as PageForSections, {
    inbound,
    outbound,
    broken,
  });

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Back row */}
      <div style={{ padding: "0 28px", height: 56, display: "flex", alignItems: "center" }}>
        <Link
          href={`/projects/${projectId}/pages-redesign`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--rr-text-2)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          Pages
        </Link>
      </div>

      {/* Header */}
      <div
        style={{
          padding: "6px 28px 18px",
          borderBottom: "1px solid var(--rr-hairline-strong)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <h1
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 19,
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              margin: 0,
              textWrap: "pretty",
            }}
          >
            {page.title || "Untitled page"}
          </h1>
          <span
            className="rr-mono"
            style={{ fontSize: 24, fontWeight: 600, lineHeight: 1, flex: "none" }}
          >
            {score}
          </span>
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span
            className="rr-mono"
            style={{
              fontSize: 12,
              color: "var(--rr-text-3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {pathOf(page.url)}
          </span>
          <div style={{ display: "flex", gap: 10, flex: "none" }}>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                height: 28,
                padding: "0 12px",
                border: "1px solid var(--rr-border-button)",
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--rr-text)",
                textDecoration: "none",
              }}
            >
              Open live
              <ExternalLink size={13} strokeWidth={1.5} />
            </a>
            <Link
              href={`/projects/${projectId}/fixes`}
              style={{
                height: 28,
                padding: "0 12px",
                background: "var(--rr-accent)",
                color: "var(--rr-accent-ink)",
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Open fix
            </Link>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: "0 28px 96px" }}>
        {sections.map((s) => (
          <DisclosureSection
            key={s.key}
            severity={s.severity}
            name={s.name}
            summary={s.summary}
            problemCount={s.problemCount}
          >
            {s.rows.map((r, i) => (
              <DetailRow
                key={i}
                label={r.label}
                value={r.value}
                tone={r.tone}
                mono={r.mono}
              />
            ))}
          </DisclosureSection>
        ))}
      </div>
    </div>
  );
}
