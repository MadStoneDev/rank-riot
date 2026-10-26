"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  FolderOpen,
  Wrench,
  Search,
  Settings,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { type ComponentType } from "react";

import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/redesign/ThemeToggle";
import { PROJECT_SECTIONS, sectionHref } from "@/components/redesign/project-sections";

// Persistent 216px sidebar for the exception-based redesign. Active navigation
// is indicated by weight + a neutral surface — never the accent colour. When a
// project is open it appears as an indented child under Projects.
type Item = {
  label: string;
  href: string | null;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

function projectIdFrom(pathname: string): string | null {
  const m = pathname.match(/^\/projects\/([^/]+)/);
  return m ? m[1] : null;
}

export function Sidebar({
  email,
  isAdmin = false,
}: {
  email: string;
  // Resolved server-side in the layout (F-P02) instead of a per-mount query.
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const projectId = projectIdFrom(pathname);

  const nav: Item[] = [
    { label: "Projects", href: "/overview", icon: FolderOpen },
    { label: "Fixes", href: "/fixes", icon: Wrench },
    { label: "Search", href: "/search", icon: Search },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Project children come from the one canonical section list (F-R06), so the
  // sidebar and the in-page ReportTabs always offer the same sections.
  const projectChildren: Item[] = projectId
    ? PROJECT_SECTIONS.map((s) => ({
        label: s.label,
        href: sectionHref(projectId, s),
        icon: s.icon,
      }))
    : [];

  const isActive = (href: string | null) =>
    !!href && (pathname === href || pathname.startsWith(href + "/"));

  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <aside className="rr-sidebar" aria-label="Main navigation">
      {/* App mark + wordmark */}
      <Link
        href="/overview"
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          color: "var(--rr-text)",
          textDecoration: "none",
          flex: "none",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: "var(--rr-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Zap size={12} strokeWidth={2} color="var(--rr-accent-ink)" />
        </span>
        <span className="rr-brand-text" style={{ fontSize: 14, fontWeight: 600 }}>
          RankRiot
        </span>
      </Link>

      {/* Primary nav */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        {nav.map((it) => (
          <div key={it.label}>
            <NavRow item={it} active={isActive(it.href)} />
            {it.label === "Projects" && projectChildren.length > 0 && (
              <div className="rr-nav-children" style={{ margin: "2px 0 6px" }}>
                {projectChildren.map((c) => (
                  <NavRow key={c.label} item={c} active={isActive(c.href)} indent />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Billing + account, pushed to the bottom */}
      <div
        style={{
          flex: "none",
          padding: "8px 8px",
          borderTop: "1px solid var(--rr-hairline)",
        }}
      >
        <NavRow
          item={{ label: "Billing", href: "/dashboard/billing", icon: CreditCard }}
          active={isActive("/dashboard/billing")}
        />
        {isAdmin && (
          <NavRow
            item={{ label: "Admin", href: "/admin", icon: ShieldCheck }}
            active={isActive("/admin")}
          />
        )}
        <ThemeToggle />
        <button
          onClick={async () => {
            await createClient().auth.signOut();
            window.location.href = "/";
          }}
          title="Sign out"
          style={{
            marginTop: 4,
            width: "100%",
            height: 44,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 8px",
            background: "none",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            color: "var(--rr-text-2)",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--rr-surface-raised)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--rr-text-2)",
              flex: "none",
            }}
          >
            {initial}
          </span>
          <span
            className="rr-side-email"
            style={{
              fontSize: 12,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </span>
        </button>
      </div>
    </aside>
  );
}

function NavRow({
  item,
  active,
  indent,
}: {
  item: Item;
  active: boolean;
  indent?: boolean;
}) {
  const Icon = item.icon;
  const inner = (
    <span
      className="rr-nav-row"
      style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: indent ? "0 8px 0 28px" : "0 8px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active
          ? "var(--rr-text)"
          : item.href
            ? "var(--rr-text-2)"
            : "var(--rr-text-3)",
        background: active ? "var(--rr-surface-raised)" : "transparent",
        cursor: item.href ? "pointer" : "default",
      }}
    >
      <Icon size={16} strokeWidth={1.5} />
      <span className="rr-nav-label">{item.label}</span>
    </span>
  );
  if (!item.href) {
    return <span title="Coming soon">{inner}</span>;
  }
  return (
    <Link href={item.href} style={{ textDecoration: "none", display: "block" }}>
      {inner}
    </Link>
  );
}
