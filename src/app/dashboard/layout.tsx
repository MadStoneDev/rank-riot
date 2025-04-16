import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";

import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}
