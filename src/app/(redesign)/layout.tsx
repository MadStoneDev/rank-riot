import "@/components/redesign/tokens.css";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { plexSans, plexMono } from "@/lib/redesign-fonts";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/redesign/Sidebar";
import { BottomNav } from "@/components/redesign/BottomNav";

// Chrome for the exception-based redesign. A sibling to (private), it gives the
// redesign its own persistent sidebar / bottom nav instead of the classic
// dashboard shell — the `.rr` token scope and IBM Plex fonts live here so
// individual screens render only their own content.
export default async function RedesignLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <div
      className={`rr rr-shell ${plexSans.variable} ${plexMono.variable}`}
    >
      {/* Apply the saved theme before paint to avoid a flash. Scoped to this
          .rr root (the token scope), not the document. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(localStorage.getItem('rr-mode')==='light'&&document.currentScript&&document.currentScript.parentElement){document.currentScript.parentElement.setAttribute('data-mode','light');}}catch(e){}",
        }}
      />
      <Sidebar email={user.email ?? ""} />
      <main className="rr-main">{children}</main>
      <BottomNav />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--rr-surface-raised)",
            border: "1px solid var(--rr-border)",
            color: "var(--rr-text)",
          },
        }}
      />
    </div>
  );
}
