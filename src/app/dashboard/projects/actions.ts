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
      scan_frequency: scan_frequency || "weekly",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Trigger a scan using the backend API
  try {
    const scanResponse = await fetch(
      `${process.env.CRAWLER_API_URL}/api/scan`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: data.id,
          notification_email: user.email,
        }),
      },
    );

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text();
      console.error("Error triggering scan:", errorText);
    } else {
      const scanData = await scanResponse.json();
      console.log("Scan triggered:", scanData);
    }
  } catch (error) {
    console.error("Error initiating scan:", error);
  }

  // Revalidate projects page
  revalidatePath("/dashboard/projects");

  // Redirect to the project page
  redirect(`/dashboard/projects/${data.id}`);
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
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !existingProject) {
    return {
      error: "Project not found or you do not have permission to update it",
    };
  }

  // Update project in database
  const { error } = await supabase
    .from("projects")
    .update({
      name,
      url: formattedUrl,
      description,
      scan_frequency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate project pages
  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath(`/dashboard/projects/${id}/settings`);
  revalidatePath("/dashboard/projects");

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
  revalidatePath("/dashboard/projects");

  // Redirect to projects list
  redirect("/dashboard/projects");
}

// Start a scan
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
    .select("id, url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return {
      error: "Project not found or you do not have permission to scan it",
    };
  }

  // Trigger a scan using the backend API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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

    // Check if we got a non-JSON response (like HTML error page)
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

    // Parse the JSON response
    const scanData = await scanResponse.json();

    if (!scanResponse.ok) {
      console.error("Error triggering scan:", scanData);
      return {
        error:
          scanData.error || "Failed to start scan. Please try again later.",
      };
    }

    console.log("Scan triggered:", scanData);

    // Revalidate project page
    revalidatePath(`/dashboard/projects/${projectId}`);

    return { success: true, scanId: scanData.id };
  } catch (error) {
    // Handle different error types
    if (error instanceof TypeError) {
      // Network errors like DNS failures, refused connections, etc.
      console.error("Network error when initiating scan:", error);
      return {
        error:
          "Could not connect to the scanning service. Please check your network connection and try again.",
      };
    } else if (error instanceof DOMException && error.name === "AbortError") {
      // Timeout errors
      console.error("Scan request timed out:", error);
      return {
        error:
          "The request timed out. The scanning service might be experiencing high load.",
      };
    } else {
      // Other errors
      console.error("Error initiating scan:", error);
      return {
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  }
}
