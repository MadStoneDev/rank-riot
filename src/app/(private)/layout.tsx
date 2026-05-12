import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import SkipLink from "@/components/ui/SkipLink";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import SubscriptionProviderWrapper from "@/providers/SubscriptionProviderWrapper";

import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <SubscriptionProviderWrapper userId={user.id} userEmail={user.email || ""}>
      <div className="min-h-screen bg-[var(--color-surface-base)]">
        <SkipLink />
        <Sidebar />

        {/* Main content area - offset by sidebar on desktop */}
        <div className="md:pl-[220px] flex flex-col min-h-screen">
          <Header />

          <main id="main-content" className="flex-1 p-5 pb-24 md:pb-6">
            <div className="max-w-7xl mx-auto">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: "var(--color-surface-overlay)",
                  border: "1px solid var(--color-border-default)",
                  color: "var(--color-text-primary)",
                },
              }}
            />
          </main>
        </div>
      </div>
    </SubscriptionProviderWrapper>
  );
}
