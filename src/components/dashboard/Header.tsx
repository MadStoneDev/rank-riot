"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconChartBar } from "@tabler/icons-react";

import { createClient } from "@/utils/supabase/client";
import { Database } from "../../../database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  paths.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip UUID-like segments but keep them in the path
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

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
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setUser(data as Profile);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="bg-white border-b border-neutral-200 h-16 flex items-center px-6">
      {/* Mobile Logo */}
      <div className="md:hidden flex items-center gap-2 mr-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <IconChartBar className="w-6 h-6 text-secondary" />
          <span className="text-lg font-bold text-neutral-900">RankRiot</span>
        </Link>
      </div>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-1 text-sm flex-1">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && (
              <IconChevronRight className="w-4 h-4 text-neutral-400 mx-1" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-neutral-900 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
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
            <p className="text-sm font-medium text-neutral-900">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs text-neutral-500">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-200 overflow-hidden ring-2 ring-neutral-100">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
