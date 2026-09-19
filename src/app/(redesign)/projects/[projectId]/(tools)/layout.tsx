import type { ReactNode } from "react";

// The classic deep tools (images / schema / sitemap / compare) now live under
// the redesign chrome. Their content is still classic-styled; this wrapper
// restores the gutter/max-width the classic layout used to provide.
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 96px" }}>
      {children}
    </div>
  );
}
