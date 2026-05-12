import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function DELETE() {
  try {
    const supabase = await createServerClient();

    // Authenticate the user making the request
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the service role client to delete user data and account
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase service role configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const userId = user.id;

    // Delete user data in dependency order.
    // Foreign-key cascades may handle some of this, but explicit deletion
    // ensures data removal even without cascade rules.

    // 1. Delete scan snapshots (via scans -> projects)
    const { data: userProjects } = await adminClient
      .from("projects")
      .select("id")
      .eq("user_id", userId);

    const projectIds = userProjects?.map((p) => p.id) || [];

    if (projectIds.length > 0) {
      // Delete scan snapshots for user's scans
      const { data: userScans } = await adminClient
        .from("scans")
        .select("id")
        .in("project_id", projectIds);

      const scanIds = userScans?.map((s) => s.id) || [];

      if (scanIds.length > 0) {
        await adminClient
          .from("scan_snapshots")
          .delete()
          .in("scan_id", scanIds);
      }

      // Delete issues, pages, page_links, scans, audit_results for user's projects
      await adminClient.from("issues").delete().in("project_id", projectIds);
      await adminClient.from("page_links").delete().in("project_id", projectIds);
      await adminClient.from("pages").delete().in("project_id", projectIds);
      await adminClient.from("scans").delete().in("project_id", projectIds);
      await adminClient
        .from("audit_results")
        .delete()
        .in("project_id", projectIds);

      // Delete the projects themselves
      await adminClient.from("projects").delete().eq("user_id", userId);
    }

    // Delete paddle webhooks associated with the user's customer ID
    const { data: profile } = await adminClient
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", userId)
      .single();

    // Delete the user's profile
    await adminClient.from("profiles").delete().eq("id", userId);

    // Delete the auth user via Admin API
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      userId,
    );

    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
