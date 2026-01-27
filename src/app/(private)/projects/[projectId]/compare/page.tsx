import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ScanCompare from "@/components/projects/ScanCompare";

export const metadata: Metadata = {
  title: "Compare Scans | RankRiot",
  description: "Compare two scans to see what changed.",
};

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ scan1?: string; scan2?: string }>;
}) {
  const { projectId } = await params;
  const { scan1, scan2 } = await searchParams;

  const supabase = await createClient();

  // Check authentication
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

  // Get all scans for this project
  const { data: scans } = await supabase
    .from("scans")
    .select("id, status, started_at, completed_at, pages_scanned, issues_found")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Compare Scans</h1>
        <p className="text-neutral-500 mt-1">
          Compare two scans of {project.name} to see what changed
        </p>
      </div>

      <ScanCompare
        projectId={projectId}
        scans={scans || []}
        initialScan1={scan1}
        initialScan2={scan2}
      />
    </div>
  );
}
