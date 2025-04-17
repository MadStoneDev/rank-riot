import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";
import ProjectSettingsForm from "@/components/projects/ProjectSettingsForm";

export default async function ProjectSettingsPage({
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

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
        >
          <IconArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Project Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage settings for {project.name}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-medium leading-6 text-neutral-900">
            General Settings
          </h3>
        </div>

        <div className="px-6 py-6">
          <ProjectSettingsForm project={project} />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-medium leading-6 text-neutral-900 text-red-600">
            Danger Zone
          </h3>
        </div>

        <div className="px-6 py-6">
          <div className="border border-red-200 rounded-md p-4">
            <h3 className="text-base font-medium text-neutral-900">
              Delete Project
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Once you delete a project, there is no going back. Please be
              certain.
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
