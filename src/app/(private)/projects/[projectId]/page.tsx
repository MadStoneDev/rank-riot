import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import SEOProjectDetailPage from "@/components/projects/SEOProjectDetailPage";
import AuditProjectDetailPage from "@/components/projects/AuditProjectDetailPage";

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
    .single();

  if (!project) {
    notFound();
  }

  // Route to appropriate page based on project type
  if (project.project_type === "audit") {
    return <AuditProjectDetailPage params={params} />;
  } else {
    return <SEOProjectDetailPage params={params} />;
  }
}
