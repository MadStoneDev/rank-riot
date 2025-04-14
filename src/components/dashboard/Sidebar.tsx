"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import {
  IconHome,
  IconFolder,
  IconSettings,
  IconLogout,
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
      href: "/dashboard/projects",
      icon: IconFolder,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: IconSettings,
    },
  ];

  return (
    <div className="h-full w-64 bg-neutral-900 text-white flex flex-col">
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold">RankRiot</h1>
      </div>

      <nav className="flex-1 pt-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm ${
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={handleSignOut}
          className="flex items-center text-neutral-400 hover:text-white text-sm w-full"
        >
          <IconLogout className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
