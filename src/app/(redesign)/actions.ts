"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import {
  canCreateProject,
  getPlanLimits,
  toPlanId,
} from "@/lib/subscription-limits";
import { computeNextScanAt } from "@/lib/scan-schedule";

// Trigger the crawler for a project. Mirrors the fetch in projects/actions.ts
// (createProject) so the redesign flow stays self-contained.
async function triggerScan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  email: string | undefined,
  maxPages: number,
  endpoint: string = "/api/scan",
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  try {
    await fetch(`${process.env.CRAWLER_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        project_id: projectId,
        email,
        options: { maxPages },
      }),
    });
  } catch (error) {
    console.error("Error triggering scan:", error);
  }
}

function formatUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function nameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Create a project from a bare URL and start its first scan — the scan box on
// the redesigned Projects screen. Lands on the report (which shows the
// in-progress state until the scan resolves).
export async function startQuickScan(formData: FormData) {
  const url = (formData.get("url") as string) ?? "";
  if (!url.trim()) redirect("/overview");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  const plan = toPlanId(profile?.subscription_tier);

  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (!canCreateProject(plan, projectCount || 0)) {
    redirect("/overview?error=limit");
  }

  const formattedUrl = formatUrl(url);
  const frequency = "weekly";
  const nextScanAt = computeNextScanAt(new Date(), frequency);

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: nameFromUrl(formattedUrl),
      url: formattedUrl,
      scan_frequency: frequency,
      next_scan_at: nextScanAt ? nextScanAt.toISOString() : null,
      project_type: "seo",
    })
    .select()
    .single();

  if (error || !project) redirect("/overview?error=create");

  await triggerScan(
    supabase,
    project.id,
    user.email,
    getPlanLimits(plan).maxPagesPerScan,
  );

  revalidatePath("/overview");
  redirect(`/projects/${project.id}/fixes`);
}

// Stop an in-progress scan: ask the crawler to cancel it. The crawl loop exits
// and the pipeline finalises the scan as "cancelled", leaving the previous
// scan's data intact.
export async function cancelScan(scanId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  try {
    const res = await fetch(
      `${process.env.CRAWLER_API_URL}/api/scan/${scanId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      },
    );
    return { ok: res.ok };
  } catch (error) {
    console.error("Error cancelling scan:", error);
    return { ok: false };
  }
}

// Re-scan (or first-scan) an existing project.
export async function rescanProject(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) redirect("/overview");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: project } = await supabase
    .from("projects")
    .select("id, project_type")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) redirect("/overview");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  const plan = toPlanId(profile?.subscription_tier);

  const isAudit = project.project_type === "audit";
  await triggerScan(
    supabase,
    projectId,
    user.email,
    getPlanLimits(plan).maxPagesPerScan,
    isAudit ? "/api/scan/audit" : "/api/scan",
  );

  // Audit projects live on the classic report; SEO on the redesigned one.
  const dest = isAudit ? `/projects/${projectId}` : `/projects/${projectId}/fixes`;
  revalidatePath(dest);
  redirect(dest);
}
