import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
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
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />

        {/* Main content area - offset by sidebar on desktop */}
        <div className="md:pl-64 flex flex-col min-h-screen">
          <Header />

          <main className="flex-1 p-6 pb-24 md:pb-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
            <Toaster />
          </main>
        </div>
      </div>
    </SubscriptionProviderWrapper>
  );
}
