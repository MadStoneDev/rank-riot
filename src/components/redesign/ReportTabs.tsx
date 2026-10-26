"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PROJECT_SECTIONS, sectionHref } from "@/components/redesign/project-sections";

// Shared section nav for the redesigned scan report. Built from the one canonical
// section list (F-R06) so it and the sidebar always offer the same sections —
// no section is reachable from only one of them. 2px accent underline on the
// active section.
export function ReportTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const items: { label: string; href: string | null }[] = PROJECT_SECTIONS.map(
    (s) => ({ label: s.label, href: sectionHref(projectId, s) }),
  );

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
