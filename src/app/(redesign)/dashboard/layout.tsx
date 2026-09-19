import type { ReactNode } from "react";

// Account settings + billing were moved under the redesign chrome. Their content
// is still classic-styled (global --color tokens); this wrapper restores the
// gutter/max-width the classic layout used to provide, so they don't render
// flush against the sidebar.
export default function DashboardAreaLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 32px 96px" }}>
      {children}
    </div>
  );
}
