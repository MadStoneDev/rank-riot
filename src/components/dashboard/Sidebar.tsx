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

  return (
    <div
      className={`fixed bottom-0 left-0 md:relative w-full md:w-[250px] md:h-full w-64 bg-neutral-900 text-white flex md:flex-col justify-stretch`}
    >
      <div
        className={`px-4 md:py-4 grid place-content-center md:block border-b border-neutral-800`}
      >
        <h1 className="text-xl font-bold">RankRiot</h1>
      </div>

      <nav className={`flex-1 md:pt-4`}>
        <ul
          className={`flex md:flex-col justify-center md:justify-start items-center md:items-start gap-2 h-full`}
        >
          {navItems.map((item) => {
            const endOfPath = item.href.substring(item.href.lastIndexOf("/"));
            const isActive = pathname.endsWith(endOfPath);

            return (
              <li key={item.name} className={`w-full`}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm ${
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <item.icon className={`mr-3 w-5 h-5`} />
                  <span className="hidden md:block">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`px-4 md:py-4 grid place-content-center md:block border-t border-neutral-800`}
      >
        <button
          onClick={handleSignOut}
          className="flex items-center text-neutral-400 hover:text-white text-sm w-full"
        >
          <IconLogout className="w-5 h-5 mr-3" />
          <span className="hidden md:block">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
