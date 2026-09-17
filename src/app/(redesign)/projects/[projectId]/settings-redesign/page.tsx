import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SettingsV2Form } from "./SettingsV2Form";

export default async function SettingsRedesignPage({
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
    .select("id, name, url, scan_frequency, settings")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) notFound();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <SettingsV2Form
        projectId={project.id}
        initialName={project.name}
        initialUrl={project.url}
        initialFrequency={project.scan_frequency ?? "manual"}
        initialSettings={
          (project.settings as Parameters<typeof SettingsV2Form>[0]["initialSettings"]) ??
          null
        }
      />
    </div>
  );
}
