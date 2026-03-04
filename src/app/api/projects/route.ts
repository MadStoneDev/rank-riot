import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PlanId } from "@/types/subscription";
import { canCreateProject, PLAN_LIMITS, PLAN_INFO } from "@/lib/subscription-limits";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const description = (formData.get("description") as string) || "";
    const scan_frequency = formData.get("scan_frequency") as string;
    const project_type = (formData.get("project_type") as string) || "seo";

    // Validate inputs
    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 },
      );
    }

    // Ensure URL has proper format
    let formattedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      formattedUrl = `https://${url}`;
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const userPlan = (profile?.subscription_tier as PlanId) || "free";

    // Get current project count
    const { count: projectCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Check if project already exists
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("url", formattedUrl)
      .eq("project_type", project_type)
      .single();

    let projectId: string;
    let isExisting = false;

    if (existingProject) {
      // Project exists - update it and trigger new scan
      projectId = existingProject.id;
      isExisting = true;

      // Update project details (name, description, scan_frequency if changed)
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          name,
          description,
          scan_frequency:
            project_type === "seo" ? scan_frequency || "weekly" : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }
    } else {
      // Check subscription limit before creating new project
      if (!canCreateProject(userPlan, projectCount || 0)) {
        const limits = PLAN_LIMITS[userPlan];
        const planInfo = PLAN_INFO[userPlan];
        return NextResponse.json(
          {
            error: `You've reached your project limit (${limits.maxProjects} projects on ${planInfo.name} plan). Please upgrade to create more projects.`,
            code: "PROJECT_LIMIT_REACHED",
            currentCount: projectCount,
            maxProjects: limits.maxProjects,
            currentPlan: userPlan,
          },
          { status: 403 },
        );
      }

      // Create new project
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name,
          url: formattedUrl,
          description,
          scan_frequency:
            project_type === "seo" ? scan_frequency || "weekly" : null,
          project_type,
          notification_email: user.email,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      projectId = data.id;
    }

    // ⚠️ VALIDATE ENV VAR
    const crawlerApiUrl = process.env.CRAWLER_API_URL;

    if (!crawlerApiUrl) {
      console.error("❌ CRAWLER_API_URL is not set in environment variables!");
      return NextResponse.json(
        {
          error: "Server configuration error: CRAWLER_API_URL not set",
          id: projectId,
          scanFailed: true,
        },
        { status: 500 },
      );
    }

    // Trigger appropriate scan type
    const endpoint = project_type === "audit" ? "/api/scan/audit" : "/api/scan";
    const fullUrl = `${crawlerApiUrl}${endpoint}`;

    // Get access token for backend auth
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    try {
      const scanResponse = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          project_id: projectId,
          email: user.email,
        }),
      });

      if (!scanResponse.ok) {
        const errorText = await scanResponse.text();
        console.error(`❌ Error triggering ${project_type} scan:`, errorText);
        console.error(`   Status: ${scanResponse.status}`);
        console.error(`   URL was: ${fullUrl}`);

        return NextResponse.json(
          {
            id: projectId,
            existing: isExisting,
            scanFailed: true,
            message: isExisting
              ? "Project updated but scan failed to start. Please try scanning manually."
              : "Project created but scan failed to start. Please try scanning manually.",
          },
          { status: isExisting ? 200 : 201 },
        );
      } else {
        const scanData = await scanResponse.json();
        console.log(
          `✅ ${project_type} scan triggered${
            isExisting ? " (existing project)" : ""
          }:`,
          scanData,
        );
      }
    } catch (error) {
      console.error(`❌ Error initiating ${project_type} scan:`, error);
      console.error(`   Attempted URL: ${fullUrl}`);
      // Project was created but scan failed — inform the user
      return NextResponse.json(
        {
          id: projectId,
          existing: isExisting,
          scanFailed: true,
          message: isExisting
            ? "Project updated but scan could not be started. Please try scanning manually."
            : "Project created but scan could not be started. Please try scanning manually.",
        },
        { status: isExisting ? 200 : 201 },
      );
    }

    // Return response with indicator if project already existed
    return NextResponse.json(
      {
        id: projectId,
        existing: isExisting,
        message: isExisting
          ? "Project updated and new scan started"
          : "Project created and scan started",
      },
      { status: isExisting ? 200 : 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all projects for this user
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
