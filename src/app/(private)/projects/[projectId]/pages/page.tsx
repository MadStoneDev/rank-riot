import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { IconSettings } from "@tabler/icons-react";

import PagesListClient from "@/components/projects/PagesListClient";

// Generate dynamic metadata based on project name
export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // Fetch project data
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  // Use project name in title if available, otherwise fallback
  const projectName = project?.name || "Project";

  return {
    title: `${projectName} - Pages | RankRiot`,
    description: `View all crawled pages and their SEO status for ${projectName}.`,
  };
}

export default async function ProjectPagesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

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

  if (!project) {
    notFound();
  }

  // Get all pages with relevant fields (filter out non-HTTP URLs like mailto:, tel:, etc.)
  const { data: allPages } = await supabase
    .from("pages")
    .select(
      "id, url, title, http_status, is_indexable, has_robots_noindex, word_count, meta_description, h1s, h2s, canonical_url, images, open_graph, twitter_card, inlink_count, outlink_count"
    )
    .eq("project_id", projectId)
    .order("url", { ascending: true });

  if (!allPages) {
    notFound();
  }

  const pages = allPages.filter((page) => /^https?:\/\//i.test(page.url));

  // Get issue counts per page
  const { data: issues } = await supabase
    .from("issues")
    .select("page_id")
    .eq("project_id", projectId)
    .eq("is_fixed", false);

  const issueCounts: { [pageId: string]: number } = {};
  if (issues) {
    issues.forEach((issue) => {
      issueCounts[issue.page_id] = (issueCounts[issue.page_id] || 0) + 1;
    });
  }

  // Link counts per page come from the crawler-computed columns on `pages`
  // (inlink_count / outlink_count). Reading them here — rather than counting
  // page_links rows in JS — avoids the PostgREST 1000-row read cap that would
  // silently undercount links on larger sites.
  const linkCounts: { [pageId: string]: number } = {};
  const inlinkCounts: { [pageId: string]: number } = {};
  pages.forEach((page) => {
    linkCounts[page.id] = page.outlink_count ?? 0;
    inlinkCounts[page.id] = page.inlink_count ?? 0;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{project.name}</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-[var(--color-text-primary)]"
            >
              {project.url}
            </a>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border-default)] text-sm font-medium rounded-lg text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <IconSettings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <PagesListClient
          pages={pages}
          projectId={projectId}
          projectName={project.name}
          issueCounts={issueCounts}
          linkCounts={linkCounts}
          inlinkCounts={inlinkCounts}
        />
      </div>
    </div>
  );
}
