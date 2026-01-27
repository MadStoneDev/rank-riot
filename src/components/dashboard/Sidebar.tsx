"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import {
  IconHome,
  IconFolder,
  IconCreditCard,
  IconSettings,
  IconLogout,
  IconChartBar,
} from "@tabler/icons-react";

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: IconHome,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: IconFolder,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: IconCreditCard,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: IconSettings,
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/projects") {
      return pathname.startsWith("/projects");
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-neutral-950 border-r border-neutral-800">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <IconChartBar className="w-7 h-7 text-secondary" />
            <span className="text-xl font-bold text-white">RankRiot</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-3 py-4 border-t border-neutral-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors w-full"
          >
            <IconLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <IconLogout className="w-5 h-5" />
            <span className="text-xs">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
