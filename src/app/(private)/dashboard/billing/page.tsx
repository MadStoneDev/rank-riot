import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BillingPageClient from "./BillingPageClient";

export const metadata: Metadata = {
  title: "Billing | RankRiot",
  description: "Manage your subscription and billing settings.",
};

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch user profile with subscription data
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, subscription_tier, subscription_status, subscription_period_end, paddle_customer_id"
    )
    .eq("id", user.id)
    .single();

  // Fetch project count
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch usage data for current month
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("scans_performed, pages_scanned")
    .eq("user_id", user.id)
    .eq("period_start", periodStart)
    .single();

  return (
    <BillingPageClient
      userId={user.id}
      userEmail={user.email || profile?.email || ""}
      plan={(profile?.subscription_tier as any) || "free"}
      status={profile?.subscription_status || null}
      periodEnd={
        profile?.subscription_period_end
          ? new Date(profile.subscription_period_end)
          : null
      }
      projectCount={projectCount || 0}
      scansThisMonth={usage?.scans_performed || 0}
      pagesThisMonth={usage?.pages_scanned || 0}
    />
  );
}
