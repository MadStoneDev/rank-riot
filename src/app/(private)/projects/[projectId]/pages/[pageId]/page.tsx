import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { IconExternalLink } from "@tabler/icons-react";

import { Database } from "../../../../../../../database.types";

// Page Detail Components
import SEOHealthScore from "@/components/page-detail/SEOHealthScore";
import IndexabilityStatus from "@/components/page-detail/IndexabilityStatus";
import TechnicalMetrics from "@/components/page-detail/TechnicalMetrics";
import MetadataCard from "@/components/page-detail/MetadataCard";
import SocialStructuredData from "@/components/page-detail/SocialStructuredData";
import HeadingHierarchy from "@/components/page-detail/HeadingHierarchy";
import EnhancedLinkList from "@/components/page-detail/EnhancedLinkList";
import EnhancedImageList from "@/components/page-detail/EnhancedImageList";
import KeywordListClient from "@/components/projects/KeywordListClient";
import ScoreRing from "@/components/ui/ScoreRing";
import Badge from "@/components/ui/Badge";
import { getPageScore } from "@/utils/page-score";
import IssueAdvicePanel from "@/components/issues/IssueAdvicePanel";

type PageLink = Database["public"]["Tables"]["page_links"]["Row"] & {
  pages?: {
    url: string;
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name || "Project";

  return {
    title: `${projectName} - Page Details | RankRiot`,
    description: `View detailed SEO analysis and metrics for a page in ${projectName}.`,
  };
}

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId, pageId } = await params;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  // Get page details
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .eq("project_id", projectId)
    .single();

  if (!project || !page) {
    notFound();
  }

  // Get outbound links
  const { data: outPageLinks } = await supabase
    .from("page_links")
    .select("*")
    .eq("project_id", projectId)
    .eq("source_page_id", pageId);

  let sortedOutPageLinks: PageLink[] = [];
  if (outPageLinks) {
    sortedOutPageLinks = [...outPageLinks].sort((a, b) => {
      if (a.destination_page_id && !b.destination_page_id) return -1;
      if (!a.destination_page_id && b.destination_page_id) return 1;
      return 0;
    });
  }

  // Get inbound links
  const normalizeUrl = (url: string): string => {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  };

  const normalizedPageUrl = normalizeUrl(page.url);

  // Escape LIKE pattern characters to prevent injection
  const escapedUrl = normalizedPageUrl.replace(/[%_\\]/g, "\\$&");

  const { data: inPageLinks } = await supabase
    .from("page_links")
    .select(
      `
      *,
      pages:source_page_id (
        url
      )
    `
    )
    .eq("project_id", projectId)
    .filter("destination_url", "ilike", `%${escapedUrl}`);

  const filteredInPageLinks =
    inPageLinks?.filter((link) => {
      return normalizeUrl(link.destination_url) === normalizedPageUrl;
    }) || [];

  // Get latest completed scan for issue scoping
  const { data: latestPageScan } = await supabase
    .from("scans")
    .select("id")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  // Get issues for this page — scoped to latest scan if available
  let pageIssuesQuery = supabase
    .from("issues")
    .select("*")
    .eq("page_id", pageId)
    .eq("is_fixed", false)
    .order("created_at", { ascending: false });
  if (latestPageScan) {
    pageIssuesQuery = pageIssuesQuery.eq("scan_id", latestPageScan.id);
  }
  const { data: pageIssues } = await pageIssuesQuery;

  // Extract data from page
  const {
    keywords = [],
    h1s = [],
    h2s = [],
    h3s = [],
    h4s = [],
    h5s = [],
    h6s = [],
    images = [],
  } = page;

  // Calculate page score for header display
  const pageScore = getPageScore({
    title: page.title,
    meta_description: page.meta_description,
    h1s: h1s as string[],
    h2s: h2s as string[],
    word_count: page.word_count,
    canonical_url: page.canonical_url,
    url: page.url,
    has_robots_noindex: page.has_robots_noindex,
    is_indexable: page.is_indexable,
    http_status: page.http_status,
    images: images as { src: string; alt: string }[],
    open_graph: page.open_graph as Record<string, any> | null,
    twitter_card: page.twitter_card as Record<string, any> | null,
  });

  // HTTP Status badge variant
  const getHttpStatusVariant = (): "good" | "warning" | "critical" => {
    const status = page.http_status;
    if (!status) return "critical";
    if (status >= 200 && status < 300) return "good";
    if (status >= 300 && status < 400) return "warning";
    return "critical";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <ScoreRing score={pageScore} size="lg" label="SEO Score" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] truncate">
                {page.title || "Untitled Page"}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-[var(--color-text-secondary)]">
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[var(--color-primary)] hover:underline transition-colors"
                >
                  {page.url}
                  <IconExternalLink className="h-4 w-4" />
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            {page.http_status && (
              <Badge variant={getHttpStatusVariant()} size="md">
                HTTP {page.http_status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* SEO Health Score */}
      <SEOHealthScore
        page={{
          title: page.title,
          meta_description: page.meta_description,
          h1s: h1s as string[],
          h2s: h2s as string[],
          word_count: page.word_count,
          canonical_url: page.canonical_url,
          url: page.url,
          has_robots_noindex: page.has_robots_noindex,
          is_indexable: page.is_indexable,
          http_status: page.http_status,
          images: images as { src: string; alt: string }[],
          open_graph: page.open_graph as Record<string, any> | null,
          twitter_card: page.twitter_card as Record<string, any> | null,
          structured_data: page.structured_data,
        }}
      />

      {/* Issue Advice Panel */}
      {pageIssues && pageIssues.length > 0 && (
        <IssueAdvicePanel
          issues={pageIssues.map(issue => ({
            id: issue.id,
            issue_type: issue.issue_type,
            severity: issue.severity,
            description: issue.description,
            details: issue.details,
          }))}
          title="Issues on This Page"
          showPageLink={false}
          projectId={projectId}
        />
      )}

      {/* Indexability & Technical Metrics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <IndexabilityStatus
          page={{
            url: page.url,
            is_indexable: page.is_indexable,
            canonical_url: page.canonical_url,
            has_robots_noindex: page.has_robots_noindex,
            has_robots_nofollow: page.has_robots_nofollow,
            redirect_url: page.redirect_url,
          }}
        />
        <TechnicalMetrics
          page={{
            http_status: page.http_status,
            load_time_ms: page.load_time_ms,
            first_byte_time_ms: page.first_byte_time_ms,
            size_bytes: page.size_bytes,
            word_count: page.word_count,
          }}
        />
      </div>

      {/* Metadata Card */}
      <MetadataCard
        title={page.title}
        metaDescription={page.meta_description}
      />

      {/* Social & Structured Data */}
      <SocialStructuredData
        openGraph={page.open_graph as Record<string, any> | null}
        twitterCard={page.twitter_card as Record<string, any> | null}
        structuredData={page.structured_data}
        schemaTypes={page.schema_types as string[] | null}
      />

      {/* Content Structure - Heading Hierarchy */}
      <HeadingHierarchy
        h1s={h1s as string[] || []}
        h2s={h2s as string[] || []}
        h3s={h3s as string[] || []}
        h4s={h4s as string[] || []}
        h5s={h5s as string[] || []}
        h6s={h6s as string[] || []}
      />

      {/* Keywords */}
      <KeywordListClient keywords={keywords as { word: string; count: number }[] || []} />

      {/* Links */}
      <EnhancedLinkList
        outboundLinks={sortedOutPageLinks}
        inboundLinks={filteredInPageLinks}
        projectId={projectId}
        pageUrl={page.url}
      />

      {/* Images */}
      <EnhancedImageList images={images as { src: string; alt: string }[] || []} />
    </div>
  );
}
