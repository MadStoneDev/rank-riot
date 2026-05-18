import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Verify the caller is an authenticated admin.
 * Returns the admin's user id on success, or a NextResponse error.
 */
async function verifyAdmin(): Promise<string | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return error("Unauthorized", 401);
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return error("Unable to verify role", 500);
  }

  if (profile.role !== "admin") {
    return error("Forbidden: admin access required", 403);
  }

  return user.id;
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

type ActionResult = { success: true; [key: string]: unknown };

async function updateRole(
  params: Record<string, unknown>,
): Promise<NextResponse> {
  const { userId, role } = params as { userId?: string; role?: string };

  if (!userId || !role) {
    return error("Missing required params: userId, role", 400);
  }

  const validRoles = ["user", "moderator", "admin"];
  if (!validRoles.includes(role)) {
    return error(`Invalid role. Must be one of: ${validRoles.join(", ")}`, 400);
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (updateError) {
    return error(`Failed to update role: ${updateError.message}`, 500);
  }

  return NextResponse.json({ success: true, userId, role });
}

async function updateSubscription(
  params: Record<string, unknown>,
): Promise<NextResponse> {
  const { userId, subscription_tier, subscription_status } = params as {
    userId?: string;
    subscription_tier?: string;
    subscription_status?: string;
  };

  if (!userId) {
    return error("Missing required param: userId", 400);
  }

  if (!subscription_tier && !subscription_status) {
    return error(
      "At least one of subscription_tier or subscription_status is required",
      400,
    );
  }

  const updates: Record<string, string> = {};
  if (subscription_tier) updates.subscription_tier = subscription_tier;
  if (subscription_status) updates.subscription_status = subscription_status;

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (updateError) {
    return error(
      `Failed to update subscription: ${updateError.message}`,
      500,
    );
  }

  return NextResponse.json({ success: true, userId, ...updates });
}

async function addNote(
  params: Record<string, unknown>,
  authorId: string,
): Promise<NextResponse> {
  const { targetType, targetId, content } = params as {
    targetType?: string;
    targetId?: string;
    content?: string;
  };

  if (!targetType || !targetId || !content) {
    return error(
      "Missing required params: targetType, targetId, content",
      400,
    );
  }

  const validTargetTypes = ["user", "project"];
  if (!validTargetTypes.includes(targetType)) {
    return error(
      `Invalid targetType. Must be one of: ${validTargetTypes.join(", ")}`,
      400,
    );
  }

  const admin = createAdminClient();
  const { data, error: insertError } = await admin
    .from("admin_notes")
    .insert({
      author_id: authorId,
      target_type: targetType,
      target_id: targetId,
      content,
    })
    .select()
    .single();

  if (insertError) {
    return error(`Failed to add note: ${insertError.message}`, 500);
  }

  return NextResponse.json({ success: true, note: data });
}

async function deleteNote(
  params: Record<string, unknown>,
): Promise<NextResponse> {
  const { noteId } = params as { noteId?: string };

  if (!noteId) {
    return error("Missing required param: noteId", 400);
  }

  const admin = createAdminClient();
  const { error: deleteError } = await admin
    .from("admin_notes")
    .delete()
    .eq("id", noteId);

  if (deleteError) {
    return error(`Failed to delete note: ${deleteError.message}`, 500);
  }

  return NextResponse.json({ success: true, noteId });
}

async function updateProject(
  params: Record<string, unknown>,
): Promise<NextResponse> {
  const { projectId, updates } = params as {
    projectId?: string;
    updates?: Record<string, unknown>;
  };

  if (!projectId || !updates || Object.keys(updates).length === 0) {
    return error("Missing required params: projectId, updates", 400);
  }

  const allowedFields = ["name", "scan_frequency", "url"];
  const sanitised: Record<string, unknown> = {};
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      sanitised[key] = updates[key];
    }
  }

  if (Object.keys(sanitised).length === 0) {
    return error(
      `No valid fields to update. Allowed: ${allowedFields.join(", ")}`,
      400,
    );
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("projects")
    .update(sanitised)
    .eq("id", projectId);

  if (updateError) {
    return error(`Failed to update project: ${updateError.message}`, 500);
  }

  return NextResponse.json({ success: true, projectId, updated: sanitised });
}

async function deleteScan(
  params: Record<string, unknown>,
): Promise<NextResponse> {
  const { scanId } = params as { scanId?: string };

  if (!scanId) {
    return error("Missing required param: scanId", 400);
  }

  const admin = createAdminClient();

  // Delete associated issues and snapshots first, then the scan itself.
  const { error: issuesError } = await admin
    .from("issues")
    .delete()
    .eq("scan_id", scanId);

  if (issuesError) {
    return error(
      `Failed to delete associated issues: ${issuesError.message}`,
      500,
    );
  }

  const { error: snapshotsError } = await admin
    .from("snapshots")
    .delete()
    .eq("scan_id", scanId);

  if (snapshotsError) {
    return error(
      `Failed to delete associated snapshots: ${snapshotsError.message}`,
      500,
    );
  }

  const { error: scanError } = await admin
    .from("scans")
    .delete()
    .eq("id", scanId);

  if (scanError) {
    return error(`Failed to delete scan: ${scanError.message}`, 500);
  }

  return NextResponse.json({ success: true, scanId });
}

async function cancelScan(
  params: Record<string, unknown>,
): Promise<NextResponse> {
  const { scanId } = params as { scanId?: string };

  if (!scanId) {
    return error("Missing required param: scanId", 400);
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("scans")
    .update({
      status: "failed",
      summary_stats: { error_message: "Cancelled by admin" },
    })
    .eq("id", scanId);

  if (updateError) {
    return error(`Failed to cancel scan: ${updateError.message}`, 500);
  }

  return NextResponse.json({ success: true, scanId, status: "failed" });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body as {
      action?: string;
      [key: string]: unknown;
    };

    if (!action) {
      return error("Missing required field: action", 400);
    }

    // Auth gate — every action requires admin role
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }
    const adminUserId: string = adminResult;

    switch (action) {
      case "update_role":
        return await updateRole(params);
      case "update_subscription":
        return await updateSubscription(params);
      case "add_note":
        return await addNote(params, adminUserId);
      case "delete_note":
        return await deleteNote(params);
      case "update_project":
        return await updateProject(params);
      case "delete_scan":
        return await deleteScan(params);
      case "cancel_scan":
        return await cancelScan(params);
      default:
        return error(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return error(message, 500);
  }
}
