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
      <div className={`pb-12 md:pb-0 h-screen flex`}>
        <Sidebar />

        <div className={`flex-1 flex flex-col overflow-hidden`}>
          <Header />

          <main className={`flex-1 overflow-y-auto bg-neutral-50 p-6`}>
            {children}
            <Toaster />
          </main>
        </div>
      </div>
    </SubscriptionProviderWrapper>
  );
}
