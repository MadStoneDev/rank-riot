"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import ExportAllModal from "@/components/export/ExportAllModal";
import type { ExportDataType, ExportableData } from "@/types/export";

interface Entry {
  dataType: ExportDataType;
  data: ExportableData;
  label?: string;
}

// "Export all" for the report: fetches every dataset for the project on demand,
// then opens the shared Export-All modal (ZIP of one CSV per dataset, or JSON/
// HTML/PDF). This is the comprehensive export; per-tab Export handles one set.
export function ReportExportAll({
  projectId,
  projectName,
  projectUrl,
}: {
  projectId: string;
  projectName: string;
  projectUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/export-all`);
      if (!res.ok) return;
      const d = await res.json();
      setEntries(d.entries ?? []);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={load}
        disabled={loading}
        title="Export every dataset (ZIP of CSVs, JSON, HTML or PDF)"
        style={{
          height: 34,
          padding: "0 14px",
          borderRadius: 7,
          border: "1px solid var(--rr-border-button)",
          background: "none",
          color: "var(--rr-text)",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Package size={14} strokeWidth={1.5} />
        {loading ? "Preparing…" : "Export all"}
      </button>
      {open && entries && (
        <ExportAllModal
          isOpen={open}
          onClose={() => setOpen(false)}
          entries={entries}
          filenamePrefix={projectName}
          projectName={projectName}
          projectUrl={projectUrl}
        />
      )}
    </>
  );
}
