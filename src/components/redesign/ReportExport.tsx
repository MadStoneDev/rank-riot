"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import ExportModal from "@/components/export/ExportModal";
import type { ExportDataType, ExportableData } from "@/types/export";

// Redesign-styled outlined "Export" that opens the existing ExportModal. The
// trigger matches the report header; the modal is the shared classic surface.
export function ReportExport({
  dataType,
  data,
  filenamePrefix,
  projectName,
  projectUrl,
}: {
  dataType: ExportDataType;
  data: ExportableData;
  filenamePrefix: string;
  projectName?: string;
  projectUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const disabled = data.length === 0;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? "Nothing to export yet" : `Export ${data.length} rows`}
        style={{
          height: 34,
          padding: "0 14px",
          borderRadius: 7,
          border: "1px solid var(--rr-border-button)",
          background: "none",
          color: disabled ? "var(--rr-text-3)" : "var(--rr-text)",
          fontSize: 13,
          fontWeight: 600,
          cursor: disabled ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Download size={14} strokeWidth={1.5} />
        Export
      </button>
      <ExportModal
        isOpen={open}
        onClose={() => setOpen(false)}
        dataType={dataType}
        data={data}
        filenamePrefix={filenamePrefix}
        projectName={projectName}
        projectUrl={projectUrl}
      />
    </>
  );
}
