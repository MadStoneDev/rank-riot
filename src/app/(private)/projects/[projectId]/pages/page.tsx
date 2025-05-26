import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { format } from "date-fns";
import { createClient } from "@/utils/supabase/server";

import {
  IconArrowLeft,
  IconLink,
  IconAlertTriangle,
  IconSettings,
  IconFile,
} from "@tabler/icons-react";

import { Database } from "../../../../../../database.types";
import { decode } from "html-entities";

type Page = Database["public"]["Tables"]["pages"]["Row"];

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

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("project_id", projectId);

  if (!pages) {
    notFound();
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">
              {pages.length} Pages Crawled
            </h3>
          </div>

          {pages && pages.length > 0 ? (
            <div className="divide-y divide-neutral-200">
              {pages.map((page: Page) => (
                <div key={page.id}>
                  <Link
                    href={`/projects/${projectId}/pages/${page.id}`}
                    className={`p-4 flex text-primary hover:bg-neutral-100 transition-all duration-300 ease-in-out`}
                  >
                    <div
                      className={`mt-1 flex-shrink-0 rounded-full p-1 text-primary`}
                    >
                      <IconFile className={`h-4 w-4 text-primary`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-neutral-900">
                        {decode(page.title)}
                      </h4>
                      <p className="mt-1 text-sm text-neutral-500">
                        {page.url}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-neutral-500">
                No issues detected in the latest scan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
