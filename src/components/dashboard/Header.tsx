"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconBolt } from "@tabler/icons-react";

import { createClient } from "@/utils/supabase/client";
import { getAvatarUrl } from "@/utils/avatar";
import { Database } from "../../../database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  paths.forEach((segment) => {
    currentPath += `/${segment}`;

    // Skip UUID-like segments but keep them in the path
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment,
      );

    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Custom labels
    if (segment === "dashboard") label = "Dashboard";
    else if (segment === "projects") label = "Projects";
    else if (segment === "billing") label = "Billing";
    else if (segment === "settings") label = "Settings";
    else if (segment === "new") label = "New Project";
    else if (segment === "pages") label = "Pages";
    else if (isUuid) label = "Details";

    breadcrumbs.push({ label, href: currentPath });
  });

  return breadcrumbs;
}

export default function Header() {
  const [user, setUser] = useState<Profile | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  const breadcrumbs = generateBreadcrumbs(pathname);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (data) {
          const profile = data as Profile;
          if (!profile.full_name && authUser.user_metadata?.full_name) {
            profile.full_name = authUser.user_metadata.full_name;
          }
          if (!profile.email && authUser.email) {
            profile.email = authUser.email;
          }
          setUser(profile);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="bg-[var(--color-surface-base)]/80 backdrop-blur-xl border-b border-[var(--color-border-subtle)] h-14 flex items-center px-6 sticky top-0 z-40">
      {/* Mobile Logo */}
      <div className="md:hidden flex items-center gap-2 mr-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-primary)] flex items-center justify-center">
            <IconBolt className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            RankRiot
          </span>
        </Link>
      </div>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-1 text-sm flex-1">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && (
              <IconChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] mx-1" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-[var(--color-text-primary)] font-medium text-[13px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors text-[13px]"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="flex items-center gap-3 ml-auto">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
              {user?.full_name || "User"}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {user?.email}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[var(--color-border-default)]">
            {getAvatarUrl(user?.avatar_url ?? null) ? (
              <img
                src={getAvatarUrl(user?.avatar_url ?? null)!}
                alt={user?.full_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[#818cf8] text-white text-xs font-semibold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
