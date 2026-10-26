import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";

// Project-scoped guard for the redesign report (F-R08). The redesign report, its
// section pages and the sidebar's project children are all SEO-scoped: an audit
// project has no SEO scan, so those routes render empty/irrelevant data and the
// nav offers sections that don't apply. Audit projects keep the classic audit
// report at /projects/[id]; send them there instead of letting them fall into
// the SEO redesign. Wrapping every sub-route in one layout means a direct or
// stale link to any section (fixes, pages, images, schema, compare, …) is caught
// in a single place.
//
// No redirect loop: /projects/[id] (the classic dispatcher) renders the audit
// report inline for audit projects and only redirects SEO projects back into
// the redesign, so an audit project lands on the classic report and stops.
export default async function RedesignProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
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
    .select("project_type")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  // Only redirect on a confirmed audit project. If the project is missing or the
  // fetch failed, fall through and let the page do its own not-found / error
  // handling, so a transient fetch error isn't turned into a misleading redirect.
  if (project?.project_type === "audit") {
    redirect(`/projects/${projectId}`);
  }

  return <>{children}</>;
}
