import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { IconArrowLeft, IconSettings } from "@tabler/icons-react";

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
    .single();

  if (!project) {
    notFound();
  }

  // Get all pages with relevant fields
  const { data: pages } = await supabase
    .from("pages")
    .select(
      "id, url, title, http_status, is_indexable, has_robots_noindex, word_count, meta_description, h1s, canonical_url, images"
    )
    .eq("project_id", projectId)
    .order("url", { ascending: true });

  if (!pages) {
    notFound();
  }

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

  // Get link counts per page (outbound links)
  const { data: links } = await supabase
    .from("page_links")
    .select("source_page_id")
    .eq("project_id", projectId);

  const linkCounts: { [pageId: string]: number } = {};
  if (links) {
    links.forEach((link) => {
      linkCounts[link.source_page_id] =
        (linkCounts[link.source_page_id] || 0) + 1;
    });
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
        >
          <IconArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{project.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {project.url}
            </a>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <IconSettings className="h-4 w-4 mr-1" />
            Settings
          </Link>
        </div>
      </div>

      <PagesListClient
        pages={pages}
        projectId={projectId}
        issueCounts={issueCounts}
        linkCounts={linkCounts}
      />
    </div>
  );
}
