"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

// Create a new project
export async function createProject(formData: FormData) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a project" };
  }

  // Extract form data
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string;
  const scan_frequency = formData.get("scan_frequency") as string;
  const project_type = (formData.get("project_type") as string) || "seo";

  // Validate inputs
  if (!name || !url) {
    return { error: "Name and URL are required" };
  }

  // Ensure URL has proper format
  let formattedUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    formattedUrl = `https://${url}`;
  }

  // Create project in database
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
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Trigger appropriate scan type
  const endpoint = project_type === "audit" ? "/api/scan/audit" : "/api/scan";

  try {
    const scanResponse = await fetch(
      `${process.env.CRAWLER_API_URL}${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: data.id,
          email: user.email,
        }),
      },
    );

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text();
      console.error(`Error triggering ${project_type} scan:`, errorText);
    } else {
      const scanData = await scanResponse.json();
      console.log(`${project_type} scan triggered:`, scanData);
    }
  } catch (error) {
    console.error(`Error initiating ${project_type} scan:`, error);
  }

  // Revalidate projects page
  revalidatePath("/projects");

  // Redirect to the project page
  redirect(`/projects/${data.id}`);
}

// Update project
export async function updateProject(formData: FormData) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update a project" };
  }

  // Extract form data
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string;
  const scan_frequency = formData.get("scan_frequency") as string;

  // Validate inputs
  if (!id || !name || !url) {
    return { error: "Project ID, name, and URL are required" };
  }

  // Ensure URL has proper format
  let formattedUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    formattedUrl = `https://${url}`;
  }

  // Check project ownership
  const { data: existingProject, error: projectError } = await supabase
    .from("projects")
    .select("id, project_type")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !existingProject) {
    return {
      error: "Project not found or you do not have permission to update it",
    };
  }

  // Update project in database
  const updateData: any = {
    name,
    url: formattedUrl,
    description,
    updated_at: new Date().toISOString(),
  };

  // Only update scan_frequency for SEO projects
  if (existingProject.project_type === "seo") {
    updateData.scan_frequency = scan_frequency;
  }

  const { error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate project pages
  revalidatePath(`/projects/${id}`);
  revalidatePath(`/projects/${id}/settings`);
  revalidatePath("/projects");

  return { success: true };
}

// Delete a project
export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a project" };
  }

  // Check project ownership
  const { data: existingProject, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !existingProject) {
    return {
      error: "Project not found or you do not have permission to delete it",
    };
  }

  // Delete project from database
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate projects page
  revalidatePath("/projects");

  // Redirect to projects list
  redirect("/projects");
}

// Start an SEO scan
export async function startScan(projectId: string) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to start a scan" };
  }

  // Check project ownership
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, url, project_type")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return {
      error: "Project not found or you do not have permission to scan it",
    };
  }

  // Ensure this is an SEO project
  if (project.project_type !== "seo") {
    return {
      error:
        "This action is only available for SEO projects. Use Run Audit for audit projects.",
    };
  }

  // Trigger a scan using the backend API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const scanResponse = await fetch(
      `${process.env.CRAWLER_API_URL}/api/scan`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          email: user.email,
        }),
        signal: controller.signal,
      },
    ).finally(() => {
      clearTimeout(timeoutId);
    });

    const contentType = scanResponse.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error(
        "Received non-JSON response:",
        await scanResponse.text().catch(() => "Unable to get response text"),
      );
      return {
        error:
          "We couldn't connect to the scanning service. Our team has been notified.",
      };
    }

    const scanData = await scanResponse.json();

    if (!scanResponse.ok) {
      console.error("Error triggering scan:", scanData);

      let errorMessage = "Failed to start scan. Please try again later.";

      if (scanData.message) {
        errorMessage = scanData.message;
      } else if (typeof scanData.error === "string") {
        errorMessage = scanData.error;
      } else if (scanData.error && scanData.error.code) {
        errorMessage = `Error: ${scanData.error.code}`;
      }

      return {
        error: errorMessage,
      };
    }

    console.log("Scan triggered:", scanData);

    revalidatePath(`/projects/${projectId}`);

    return { success: true, scanId: scanData.data?.scan_id || scanData.id };
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Network error when initiating scan:", error);
      return {
        error:
          "Could not connect to the scanning service. Please check your network connection and try again.",
      };
    } else if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Scan request timed out:", error);
      return {
        error:
          "The request timed out. The scanning service might be experiencing high load.",
      };
    } else {
      console.error("Error initiating scan:", error);
      return {
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  }
}

// Start an audit scan
export async function startAuditScan(projectId: string) {
  console.log("================================");
  console.log("🟦 SERVER ACTION: startAuditScan called");
  console.log("🟦 projectId:", projectId);
  console.log("🟦 CRAWLER_API_URL:", process.env.CRAWLER_API_URL);
  console.log("================================");

  try {
    const supabase = await createClient();
    console.log("🟦 Supabase client created");

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("🟦 User:", user?.id);

    if (!user) {
      console.log("🟦 No user - returning error");
      return { error: "You must be logged in to start an audit" };
    }

    // Check project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, url, project_type")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return {
        error: "Project not found or you do not have permission to audit it",
      };
    }

    // Ensure this is an audit project
    if (project.project_type !== "audit") {
      return {
        error:
          "This action is only available for audit projects. Use Start Scan for SEO projects.",
      };
    }

    // Trigger an audit scan using the backend API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const scanResponse = await fetch(
      `${process.env.CRAWLER_API_URL}/api/scan/audit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          email: user.email,
        }),
        signal: controller.signal,
      },
    ).finally(() => {
      clearTimeout(timeoutId);
    });

    const contentType = scanResponse.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error(
        "Received non-JSON response:",
        await scanResponse.text().catch(() => "Unable to get response text"),
      );
      return {
        error:
          "We couldn't connect to the audit service. Our team has been notified.",
      };
    }

    const scanData = await scanResponse.json();

    if (!scanResponse.ok) {
      console.error("Error triggering audit:", scanData);

      let errorMessage = "Failed to start audit. Please try again later.";

      if (scanData.message) {
        errorMessage = scanData.message;
      } else if (typeof scanData.error === "string") {
        errorMessage = scanData.error;
      } else if (scanData.error && scanData.error.code) {
        errorMessage = `Error: ${scanData.error.code}`;
      }

      return {
        error: errorMessage,
      };
    }

    console.log("Audit triggered:", scanData);

    revalidatePath(`/projects/${projectId}`);

    return { success: true, scanId: scanData.data?.scan_id || scanData.id };
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Network error when initiating audit:", error);
      return {
        error:
          "Could not connect to the audit service. Please check your network connection and try again.",
      };
    } else if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Audit request timed out:", error);
      return {
        error:
          "The request timed out. The audit service might be experiencing high load.",
      };
    } else {
      console.error("Error initiating audit:", error);
      return {
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  }
}
