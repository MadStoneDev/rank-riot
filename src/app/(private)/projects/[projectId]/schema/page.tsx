import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SchemaAuditView from "@/components/projects/SchemaAuditView";

export const metadata: Metadata = {
  title: "Schema & Structured Data | RankRiot",
};

export default async function SchemaAuditPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  // Get all pages with schema / OG data (exclude non-HTTP URLs)
  const { data: pages } = await supabase
    .from("pages")
    .select("id, url, title, schema_types, structured_data, open_graph, twitter_card")
    .eq("project_id", projectId)
    .like("url", "http%")
    .order("url");

  return (
    <SchemaAuditView
      pages={pages || []}
      projectId={projectId}
      projectName={project.name}
    />
  );
}
