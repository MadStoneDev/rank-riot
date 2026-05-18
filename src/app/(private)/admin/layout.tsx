import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border-default)]">
        <span className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded bg-[var(--color-severity-critical)]/20 text-[var(--color-severity-critical)]">
          Admin
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <a
            href="/admin"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Overview
          </a>
          <a
            href="/admin/users"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Users
          </a>
          <a
            href="/admin/scans"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Scans
          </a>
        </nav>
      </div>
      {children}
    </div>
  );
}
