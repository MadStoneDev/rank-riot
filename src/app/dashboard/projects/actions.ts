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

  // Create a new scan record
  const { data: scan, error: scanError } = await supabase
    .from("scans")
    .insert({
      project_id: projectId,
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (scanError) {
    return { error: scanError.message };
  }

  // Update project's last_scan_at
  await supabase
    .from("projects")
    .update({
      last_scan_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  // Trigger a scan using the backend API (will implement later)
  // This would be an API call to your crawler backend
  // await fetch(`${process.env.CRAWLER_API_URL}/scan`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ scan_id: scan.id, project_id: projectId, url: project.url }),
  // });

  // For now, we'll simulate a scan with a timeout
  // This would be removed in the real implementation
  setTimeout(async () => {
    // Update the scan status to completed
    await supabase
      .from("scans")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        pages_scanned: Math.floor(Math.random() * 50) + 10,
        issues_found: Math.floor(Math.random() * 20),
      })
      .eq("id", scan.id);

    // Revalidate project page
    revalidatePath(`/dashboard/projects/${projectId}`);
  }, 30000); // 30 seconds

  // Revalidate project page
  revalidatePath(`/dashboard/projects/${projectId}`);

  return { success: true, scanId: scan.id };
}
