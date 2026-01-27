import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import ProjectSettingsForm from "@/components/projects/ProjectSettingsForm";

// Generate dynamic metadata based on project name
export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name || "Project";

  return {
    title: `${projectName} - Settings | RankRiot`,
    description: `Manage settings and configuration for ${projectName}.`,
  };
}

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Project Settings</h1>
        <p className="text-neutral-500 mt-1">
          Manage settings for {project.name}
        </p>
      </div>

      {/* General Settings Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            General Settings
          </h2>
        </div>

        <ProjectSettingsForm project={project} />
      </div>
    </div>
  );
}
