"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Shared section nav for the redesigned scan report. Fixes and Pages are built;
// Speed / Content / AEO / History are muted placeholders until their screens
// land. 2px accent underline on the active section.
export function ReportTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const items: { label: string; href: string | null }[] = [
    { label: "Fixes", href: `/projects/${projectId}/fixes` },
    { label: "Pages", href: `/projects/${projectId}/pages-redesign` },
    { label: "Speed", href: null },
    { label: "Content", href: null },
    { label: "AEO", href: null },
    { label: "History", href: null },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 26,
        borderBottom: "1px solid var(--rr-hairline)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {items.map((it) => {
        const active = !!it.href && pathname === it.href;
        const base = {
          padding: "0 0 11px",
          fontSize: 14,
          whiteSpace: "nowrap" as const,
          fontWeight: active ? 600 : 400,
          color: active
            ? "var(--rr-text)"
            : it.href
              ? "var(--rr-text-2)"
              : "var(--rr-text-3)",
          boxShadow: active ? "inset 0 -2px 0 var(--rr-accent)" : "none",
        };
        return it.href ? (
          <Link
            key={it.label}
            href={it.href}
            style={{ ...base, textDecoration: "none" }}
          >
            {it.label}
          </Link>
        ) : (
          <span key={it.label} style={{ ...base, cursor: "default" }} title="Coming soon">
            {it.label}
          </span>
        );
      })}
    </div>
  );
}
