"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import {
  IconLayoutDashboard,
  IconFolder,
  IconCreditCard,
  IconSettings,
  IconLogout,
  IconBolt,
} from "@tabler/icons-react";
import AdminNavLink from "@/components/dashboard/AdminNavLink";

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
      icon: IconLayoutDashboard,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: IconFolder,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: IconCreditCard,
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
      <aside
        aria-label="Main navigation"
        className="hidden md:flex md:w-[220px] md:flex-col md:fixed md:inset-y-0 bg-[var(--color-surface-base)] border-r border-[var(--color-border-subtle)]"
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[var(--color-border-subtle)]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <IconBolt className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
              RankRiot
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" stroke={isActive ? 2 : 1.5} />
                {item.name}
              </Link>
            );
          })}
          <AdminNavLink />
        </nav>

        {/* Sign Out */}
        <div className="px-3 py-3 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)] transition-all duration-150 w-full"
          >
            <IconLogout className="w-[18px] h-[18px]" stroke={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface-base)] border-t border-[var(--color-border-subtle)] z-50 backdrop-blur-xl"
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                <item.icon className="w-5 h-5" stroke={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <IconLogout className="w-5 h-5" stroke={1.5} />
            <span className="text-[10px] font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
