import "@/components/redesign/tokens.css";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { plexSans, plexMono } from "@/lib/redesign-fonts";

import { Sidebar } from "@/components/redesign/Sidebar";
import { BottomNav } from "@/components/redesign/BottomNav";
import SkipLink from "@/components/ui/SkipLink";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import SubscriptionProviderWrapper from "@/providers/SubscriptionProviderWrapper";

import { Toaster } from "sonner";

// The remaining classic surfaces (audit report, new-project, admin, orphaned
// classic pages) now render inside the redesign chrome. Their content is
// classic-styled but adopts the redesign palette via the --color-* → --rr-*
// aliases in tokens.css, and follows the redesign light/dark toggle. A padded
// max-width main restores the gutter the classic layout used to provide.
export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className={`rr rr-shell ${plexSans.variable} ${plexMono.variable}`}>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(localStorage.getItem('rr-mode')==='light'&&document.currentScript&&document.currentScript.parentElement){document.currentScript.parentElement.setAttribute('data-mode','light');}}catch(e){}",
        }}
      />
      <SkipLink />
      <Sidebar email={user.email ?? ""} />
      <main id="main-content" className="rr-main">
        <SubscriptionProviderWrapper userId={user.id} userEmail={user.email || ""}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 32px 96px" }}>
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </SubscriptionProviderWrapper>
      </main>
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
