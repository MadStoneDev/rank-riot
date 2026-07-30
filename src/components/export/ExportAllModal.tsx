"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  IconFileZip,
  IconJson,
  IconFileTypePdf,
  IconHtml,
} from "@tabler/icons-react";
import Modal from "@/components/ui/Modal";
import { useHasPdfReports } from "@/hooks/useSubscription";
import {
  ExportDataType,
  ExportableData,
  EXPORT_COLUMN_REGISTRY,
  EXPORT_DATA_TYPE_LABELS,
} from "@/types/export";
import PdfBrandingForm from "@/components/export/PdfBrandingForm";
import { PdfBranding } from "@/utils/pdf-report";
import {
  CombinedDataset,
  downloadCombinedJSON,
  downloadCombinedCsvZip,
  downloadCombinedHTML,
  downloadCombinedPDF,
} from "@/utils/combined-report";

interface ExportEntry {
  dataType: ExportDataType;
  data: ExportableData;
  label?: string;
}

interface ExportAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ExportEntry[];
  filenamePrefix: string;
  projectName?: string;
  projectUrl?: string;
}

type AllFormat = "csv-zip" | "json" | "html" | "pdf";

const FORMAT_OPTIONS: {
  value: AllFormat;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  proOnly?: boolean;
  hint: string;
}[] = [
  { value: "csv-zip", label: "CSV (ZIP)", icon: IconFileZip, hint: "One CSV per dataset, zipped" },
  { value: "json", label: "JSON", icon: IconJson, hint: "One structured file" },
  { value: "html", label: "HTML", icon: IconHtml, proOnly: true, hint: "One report, all sections" },
  { value: "pdf", label: "PDF", icon: IconFileTypePdf, proOnly: true, hint: "One document, all sections" },
];

export default function ExportAllModal({
  isOpen,
  onClose,
  entries,
  filenamePrefix,
  projectName,
  projectUrl,
}: ExportAllModalProps) {
  const hasPdfReports = useHasPdfReports();

  // Only datasets that actually have rows are selectable.
  const availableEntries = useMemo(() => entries.filter((e) => e.data.length > 0), [entries]);

  const [format, setFormat] = useState<AllFormat>("csv-zip");
  const [selected, setSelected] = useState<Set<ExportDataType>>(
    () => new Set(availableEntries.map((e) => e.dataType)),
  );
  const [branding, setBranding] = useState<PdfBranding>({});
  const [busy, setBusy] = useState(false);
  const handleBrandingChange = useCallback((b: PdfBranding) => setBranding(b), []);

  const toggle = (dt: ExportDataType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dt)) next.delete(dt);
      else next.add(dt);
      return next;
    });
  };

  const buildDatasets = (): CombinedDataset[] =>
    availableEntries
      .filter((e) => selected.has(e.dataType))
      .map((e) => {
        // Use each type's default-selected columns for the combined export.
        const cols = (EXPORT_COLUMN_REGISTRY[e.dataType] || []).filter((c) => c.defaultSelected);
        return {
          dataType: e.dataType,
          label: e.label || EXPORT_DATA_TYPE_LABELS[e.dataType] || e.dataType,
          columns: cols,
          data: e.data,
        };
      });

  const handleExport = async () => {
    const datasets = buildDatasets();
    if (datasets.length === 0) {
      toast.error("Select at least one dataset to export.");
      return;
    }
    const meta = { projectName, projectUrl };
    try {
      setBusy(true);
      switch (format) {
        case "json":
          downloadCombinedJSON(datasets, meta, `${filenamePrefix}-full-export`);
          break;
        case "csv-zip":
          await downloadCombinedCsvZip(datasets, meta, `${filenamePrefix}-full-export`);
          break;
        case "html":
          downloadCombinedHTML(datasets, meta, branding, `${filenamePrefix}-full-report`);
          break;
        case "pdf":
          downloadCombinedPDF(datasets, meta, branding, `${filenamePrefix}-full-report`);
          break;
      }
      const totalRows = datasets.reduce((n, d) => n + d.data.length, 0);
      toast.success(`Exported ${datasets.length} datasets (${totalRows} rows)`);
      onClose();
    } catch (err) {
      toast.error("Export failed. Please try again.");
      console.error("Combined export failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const showBranding = format === "html" || format === "pdf";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Everything"
      subtitle={`${availableEntries.length} datasets available`}
      maxWidth="max-w-xl"
    >
      <div className="p-6 space-y-5">
        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Format</label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map(({ value, label, icon: Icon, proOnly, hint }) => {
              const disabled = proOnly && !hasPdfReports;
              return (
                <button
                  key={value}
                  onClick={() => !disabled && setFormat(value)}
                  disabled={disabled}
                  aria-pressed={format === value}
                  className={`flex flex-col items-start gap-0.5 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                    format === value
                      ? "border-primary bg-primary/10 text-primary"
                      : disabled
                        ? "border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] cursor-not-allowed"
                        : "border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Icon className="h-4 w-4" />
                    {label}
                    {proOnly && !hasPdfReports && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 bg-[var(--color-score-warning-muted)] text-[var(--color-score-warning)] rounded-full">
                        PRO
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {showBranding && <PdfBrandingForm onBrandingChange={handleBrandingChange} />}

        {/* Dataset selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              Datasets ({selected.size} of {availableEntries.length})
            </label>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setSelected(new Set(availableEntries.map((e) => e.dataType)))}
                className="text-primary hover:underline"
              >
                All
              </button>
              <span className="text-[var(--color-text-muted)]">|</span>
              <button
                onClick={() => setSelected(new Set())}
                className="text-primary hover:underline"
              >
                None
              </button>
            </div>
          </div>
          <div className="border border-[var(--color-border-default)] rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {availableEntries.map((e) => {
              const label = e.label || EXPORT_DATA_TYPE_LABELS[e.dataType] || e.dataType;
              return (
                <label
                  key={e.dataType}
                  className="flex items-center justify-between gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(e.dataType)}
                      onChange={() => toggle(e.dataType)}
                      className="rounded border-[var(--color-border-default)] text-primary focus:ring-primary"
                    />
                    {label}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">{e.data.length}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-surface-overlay)] rounded-b-2xl">
        <p className="text-sm text-[var(--color-text-muted)]">
          {selected.size} dataset{selected.size === 1 ? "" : "s"} selected
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] border border-[var(--color-border-default)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selected.size === 0 || busy}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Exporting…" : "Export Everything"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
