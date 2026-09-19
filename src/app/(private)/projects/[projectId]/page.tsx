import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import AuditProjectDetailPage from "@/components/projects/AuditProjectDetailPage";

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
    title: `${projectName} - Overview | RankRiot`,
    description: `View SEO analysis, site health, and optimization recommendations for ${projectName}.`,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get project to check type
  const { data: project } = await supabase
    .from("projects")
    .select("project_type")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!project) {
    notFound();
  }

  // Route to appropriate page based on project type
  // Switched over: SEO projects use the redesigned report. Audit projects keep
  // the classic audit report (the redesign is SEO-scoped).
  if (project.project_type === "audit") {
    return <AuditProjectDetailPage params={params} />;
  }

  redirect(`/projects/${projectId}/fixes`);
}
