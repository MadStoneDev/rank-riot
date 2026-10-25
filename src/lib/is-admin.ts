import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Whether a user has the admin role. Resolved server-side with the service-role
 * client so the result is authoritative and can't be spoofed from the browser.
 * Layouts pass the result to the client Sidebar instead of the Sidebar running
 * its own profiles query on every mount (F-P02).
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}
