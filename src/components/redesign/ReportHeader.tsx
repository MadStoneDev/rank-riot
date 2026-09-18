import { rescanProject } from "@/app/(redesign)/actions";

// Shared 64px report header for the redesigned scan-report tabs: project name,
// a mono meta line, and the single accent action (Rescan). Server component —
// the Rescan form posts the existing server action.
export function ReportHeader({
  projectName,
  meta,
  projectId,
}: {
  projectName: string;
  meta: string;
  projectId: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "0 32px",
        height: 64,
        borderBottom: "1px solid var(--rr-hairline)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{projectName}</h1>
        <span
          className="rr-mono"
          style={{
            fontSize: 12,
            color: "var(--rr-text-3)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {meta}
        </span>
      </div>
      <form action={rescanProject} style={{ flex: "none" }}>
        <input type="hidden" name="projectId" value={projectId} />
        <button
          type="submit"
          style={{
            height: 34,
            padding: "0 16px",
            borderRadius: 7,
            background: "var(--rr-accent)",
            color: "var(--rr-accent-ink)",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Rescan
        </button>
      </form>
    </div>
  );
}
