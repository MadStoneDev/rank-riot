"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Wrench, Search, Settings } from "lucide-react";
import type { ComponentType } from "react";

// Phone bottom nav — four items, always visible, never a hamburger. Active is
// weight 600 + text-primary; inactive is text-meta. No accent colour here.
type Item = {
  label: string;
  href: string | null;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

export function BottomNav() {
  const pathname = usePathname();
  const items: Item[] = [
    { label: "Projects", href: "/projects", icon: FolderOpen },
    { label: "Fixes", href: null, icon: Wrench },
    { label: "Search", href: null, icon: Search },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string | null) =>
    !!href && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="rr-bottomnav" aria-label="Main navigation">
      {items.map((it) => {
        const active = isActive(it.href);
        const Icon = it.icon;
        const content = (
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              color: active
                ? "var(--rr-text)"
                : it.href
                  ? "var(--rr-text-2)"
                  : "var(--rr-text-3)",
            }}
          >
            <Icon size={16} strokeWidth={1.5} />
            {it.label}
          </span>
        );
        return it.href ? (
          <Link
            key={it.label}
            href={it.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            {content}
          </Link>
        ) : (
          <span
            key={it.label}
            title="Coming soon"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {content}
          </span>
        );
      })}
    </nav>
  );
}
