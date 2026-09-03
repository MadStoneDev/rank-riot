import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Toggle an issue's `dismissed` flag. POST dismisses ("won't fix / by design"),
// DELETE restores it. Dismissed issues are preserved across re-scans by the
// crawler's fingerprint reconciliation, and are excluded from every open-issue
// count while remaining viewable behind the "show dismissed" toggle.
async function setDismissed(
  projectId: string,
  issueId: string,
  dismissed: boolean,
) {
  const supabase = await createClient();

  // Verify authentication and project ownership (mirrors the compare route).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: updated, error } = await supabase
    .from("issues")
    .update({
      dismissed,
      dismissed_at: dismissed ? new Date().toISOString() : null,
    })
    .eq("id", issueId)
    .eq("project_id", projectId)
    .select("id, dismissed, dismissed_at")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  return NextResponse.json({ issue: updated });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; issueId: string }> },
) {
  const { projectId, issueId } = await params;
  return setDismissed(projectId, issueId, true);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; issueId: string }> },
) {
  const { projectId, issueId } = await params;
  return setDismissed(projectId, issueId, false);
}
