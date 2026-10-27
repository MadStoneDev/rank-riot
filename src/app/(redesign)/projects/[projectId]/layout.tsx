import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";

// Project-scoped auth for the redesign report. The former F-R08 guard that
// bounced audit projects to the classic report is gone: audit projects now have
// their own report in the redesign at /projects/[id] (the base page dispatches
// by project_type), so there is nothing to redirect them to. Each page still
// does its own project fetch / not-found handling.
export default async function RedesignProjectLayout({
  children,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return <>{children}</>;
}
