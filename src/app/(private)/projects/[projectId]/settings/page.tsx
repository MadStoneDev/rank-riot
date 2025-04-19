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

  const handleDeleteProject = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      // Delete the project
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      // Redirect to dashboard
      redirect("/projects");
    }
  };

  if (!project) {
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-500">
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

        <ProjectSettingsForm project={project} />
      </div>
    </div>
  );
}
