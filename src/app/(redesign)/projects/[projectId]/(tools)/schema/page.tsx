import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchAllProjectPages, PAGE_LIST_CEILING } from "@/lib/server/project-pages";
import SchemaAuditView from "@/components/projects/SchemaAuditView";

interface SchemaPageRow {
  id: string;
  url: string;
  title: string | null;
  schema_types: string[] | null;
  structured_data: unknown;
  open_graph: unknown;
  twitter_card: unknown;
}

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
    .is("deleted_at", null)
    .single();

  if (!project) notFound();

  // Get all pages with schema / OG data, paginated and ceiling-bounded (F-P01)
  // so coverage reflects every page, not just the first 1000.
  const pages = await fetchAllProjectPages<SchemaPageRow>(
    supabase,
    projectId,
    "id, url, title, schema_types, structured_data, open_graph, twitter_card",
    { orderBy: "url", max: PAGE_LIST_CEILING },
  );

  return (
    <SchemaAuditView
      pages={pages}
      projectId={projectId}
      projectName={project.name}
    />
  );
}
