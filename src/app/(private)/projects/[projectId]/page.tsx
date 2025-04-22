import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import {
  IconArrowLeft,
  IconLink,
  IconAlertTriangle,
  IconSettings,
  IconFile,
  IconTrash,
} from "@tabler/icons-react";

import ScanHistory from "@/components/projects/ScanHistory";
import ScanProgress from "@/components/projects/ScanProgress";
import StartScanButton from "@/components/projects/StartScanButton";

import { Database } from "../../../../../database.types";

type Scan = Database["public"]["Tables"]["scans"]["Row"];

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
    title: `${projectName} | RankRiot`,
  };
}

export default async function ProjectDetailPage({
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

  // Get project statistics
  const { count: pagesCount } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { count: issuesCount } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("is_fixed", false);

  const { count: brokenLinksCount } = await supabase
    .from("page_links")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("is_broken", true);

  // Get the latest scan
  const { data: latestScan } = await supabase
    .from("scans")
    .select("*")
    .eq("project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  // Get recent issues
  const { data: recentIssues } = await supabase
    .from("issues")
    .select(
      `
      *,
      pages(url, title)
    `,
    )
    .eq("project_id", projectId)
    .eq("is_fixed", false)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get scan history
  const { data: scanHistory } = await supabase
    .from("scans")
    .select("*")
    .eq("project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
        >
          <IconArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-500">
            {project.name}
          </h1>
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
          <StartScanButton projectId={projectId} />

          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <IconSettings className="h-4 w-4 mr-1" />
            Settings
          </Link>
        </div>
      </div>

      {latestScan && latestScan.status === "in_progress" && (
        <ScanProgress scanId={latestScan.id} projectId={projectId} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href={`/projects/${projectId}/pages`}
          className={`bg-white hover:bg-neutral-100 rounded-lg shadow p-6 transition-all duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Pages</h3>
            </div>

            <span className="text-2xl font-bold text-neutral-900">
              {pagesCount || 0}
            </span>
          </div>
          <div className="flex items-center">
            <IconFile className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm text-neutral-500">
              Total pages scanned
            </span>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-neutral-900">
              Broken Links
            </h3>
            <span
              className={`text-2xl font-bold ${
                brokenLinksCount && brokenLinksCount > 0
                  ? "text-red-600"
                  : "text-neutral-900"
              }`}
            >
              {brokenLinksCount || 0}
            </span>
          </div>
          <div className="flex items-center">
            <IconLink className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm text-neutral-500">
              Links returning 404 status
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-neutral-900">Issues</h3>
            <span
              className={`text-2xl font-bold ${
                issuesCount && issuesCount > 0
                  ? "text-yellow-600"
                  : "text-neutral-900"
              }`}
            >
              {issuesCount}
            </span>
          </div>
          <div className="flex items-center">
            <IconAlertTriangle className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm text-neutral-500">
              SEO issues detected
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/*<div className="bg-white rounded-lg shadow overflow-hidden">*/}
        {/*  <div className="px-6 py-4 border-b border-neutral-200">*/}
        {/*    <h3 className="text-lg font-medium text-neutral-900">*/}
        {/*      Recent Issues*/}
        {/*    </h3>*/}
        {/*  </div>*/}

        {/*  {recentIssues && recentIssues.length > 0 ? (*/}
        {/*    <div className="divide-y divide-neutral-200">*/}
        {/*      {recentIssues.map((issue: any) => (*/}
        {/*        <div key={issue.id} className="p-4">*/}
        {/*          <div className="flex items-start">*/}
        {/*            <div*/}
        {/*              className={`mt-1 flex-shrink-0 rounded-full p-1 ${*/}
        {/*                issue.severity === "critical"*/}
        {/*                  ? "bg-red-100"*/}
        {/*                  : issue.severity === "high"*/}
        {/*                    ? "bg-orange-100"*/}
        {/*                    : issue.severity === "medium"*/}
        {/*                      ? "bg-yellow-100"*/}
        {/*                      : "bg-blue-100"*/}
        {/*              }`}*/}
        {/*            >*/}
        {/*              <IconAlertTriangle*/}
        {/*                className={`h-4 w-4 ${*/}
        {/*                  issue.severity === "critical"*/}
        {/*                    ? "text-red-600"*/}
        {/*                    : issue.severity === "high"*/}
        {/*                      ? "text-orange-600"*/}
        {/*                      : issue.severity === "medium"*/}
        {/*                        ? "text-yellow-600"*/}
        {/*                        : "text-blue-600"*/}
        {/*                }`}*/}
        {/*              />*/}
        {/*            </div>*/}
        {/*            <div className="ml-3 flex-1">*/}
        {/*              <h4 className="text-sm font-medium text-neutral-900">*/}
        {/*                {issue.issue_type*/}
        {/*                  .replace(/_/g, " ")*/}
        {/*                  .replace(/\b[a-z]/g, (c: string) => c.toUpperCase())}*/}
        {/*              </h4>*/}
        {/*              <p className="mt-1 text-sm text-neutral-500">*/}
        {/*                {issue.description}*/}
        {/*              </p>*/}
        {/*              <p*/}
        {/*                className={`mt-1 flex items-center gap-1 text-xs text-neutral-500`}*/}
        {/*              >*/}
        {/*                Page:{" "}*/}
        {/*                <a*/}
        {/*                  href={issue.pages.url}*/}
        {/*                  target="_blank"*/}
        {/*                  rel="noopener noreferrer"*/}
        {/*                  className="hover:underline truncate inline-block max-w-xs"*/}
        {/*                >*/}
        {/*                  {issue.pages.title || issue.pages.url}*/}
        {/*                </a>*/}
        {/*              </p>*/}
        {/*            </div>*/}
        {/*            <div className="ml-3 flex-shrink-0">*/}
        {/*              <span*/}
        {/*                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${*/}
        {/*                  issue.severity === "critical"*/}
        {/*                    ? "bg-red-100 text-red-800"*/}
        {/*                    : issue.severity === "high"*/}
        {/*                      ? "bg-orange-100 text-orange-800"*/}
        {/*                      : issue.severity === "medium"*/}
        {/*                        ? "bg-yellow-100 text-yellow-800"*/}
        {/*                        : "bg-blue-100 text-blue-800"*/}
        {/*                }`}*/}
        {/*              >*/}
        {/*                {issue.severity}*/}
        {/*              </span>*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      ))}*/}
        {/*    </div>*/}
        {/*  ) : (*/}
        {/*    <div className="p-6 text-center">*/}
        {/*      <p className="text-neutral-500">*/}
        {/*        No issues detected in the latest scan.*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*  )}*/}

        {/*  {recentIssues && recentIssues.length > 0 && (*/}
        {/*    <div className="px-6 py-4 border-t border-neutral-200">*/}
        {/*      <Link*/}
        {/*        href={`/projects/${projectId}/issues`}*/}
        {/*        className="text-primary-600 hover:text-primary-700 text-sm font-medium"*/}
        {/*      >*/}
        {/*        View all issues*/}
        {/*      </Link>*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*</div>*/}

        <ScanHistory
          initialScans={(scanHistory as Scan[]) || []}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
