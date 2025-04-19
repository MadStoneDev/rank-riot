"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// Update user profile
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update your profile" };
  }

  // Extract form data
  const full_name = formData.get("full_name") as string;

  // Update profile in database
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate settings page
  revalidatePath("/dashboard/settings");

  return { success: true };
}
