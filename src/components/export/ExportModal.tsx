"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  IconFileTypeCsv,
  IconJson,
  IconFileText,
  IconFileTypePdf,
  IconHtml,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import Modal from "@/components/ui/Modal";
import { useHasPdfReports } from "@/hooks/useSubscription";
import {
  ExportColumnDefinition,
  ExportDataType,
  ExportFormat,
  ExportableData,
  EXPORT_COLUMN_REGISTRY,
  EXPORT_FILTERS,
  EXPORT_DATA_TYPE_LABELS,
} from "@/types/export";
import { executeExport } from "@/utils/export";
import PdfBrandingForm from "@/components/export/PdfBrandingForm";
import { PdfBranding } from "@/utils/pdf-report";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: ExportDataType;
  data: ExportableData;
  filenamePrefix: string;
  projectName?: string;
  projectUrl?: string;
  allowedFormats?: ExportFormat[];
}

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  proOnly?: boolean;
}[] = [
  { value: "csv", label: "CSV", icon: IconFileTypeCsv },
  { value: "json", label: "JSON", icon: IconJson },
  { value: "text", label: "Plain Text", icon: IconFileText },
  { value: "pdf", label: "PDF", icon: IconFileTypePdf, proOnly: true },
  { value: "html", label: "HTML", icon: IconHtml, proOnly: true },
];

export default function ExportModal({
  isOpen,
  onClose,
  dataType,
  data,
  filenamePrefix,
  projectName,
  projectUrl,
  allowedFormats,
}: ExportModalProps) {
  const hasPdfReports = useHasPdfReports();
  const availableColumns = EXPORT_COLUMN_REGISTRY[dataType] || [];
  const filters = EXPORT_FILTERS[dataType] || [];

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    () => new Set(availableColumns.filter((c) => c.defaultSelected).map((c) => c.key))
  );
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState<number | null>(null);
  const [columnsExpanded, setColumnsExpanded] = useState(false);
  const [pdfBranding, setPdfBranding] = useState<PdfBranding>({});
  const handleBrandingChange = useCallback((b: PdfBranding) => setPdfBranding(b), []);

  const formats = allowedFormats
    ? FORMAT_OPTIONS.filter((f) => allowedFormats.includes(f.value))
    : FORMAT_OPTIONS;

  // Apply filter → sort → limit
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
    const filterDef = filters.find((f) => f.key === activeFilter);
    if (filterDef) {
      result = result.filter(filterDef.predicate);
    }

    // Sort
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    // Limit
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }, [data, activeFilter, sortBy, sortDirection, limit, filters]);

  const activeColumnsArray = availableColumns.filter((c) =>
    selectedColumns.has(c.key)
  );

  const handleExport = () => {
    if (processedData.length === 0) {
      toast.error("No data to export with current filters.");
      return;
    }
    if (activeColumnsArray.length === 0) {
      toast.error("Select at least one column to export.");
      return;
    }

    const ext = selectedFormat === "text" ? "txt" : selectedFormat;
    const filename = `${filenamePrefix}-${dataType}.${ext}`;

    executeExport(
      selectedFormat,
      processedData,
      activeColumnsArray,
      filename,
      (selectedFormat === "pdf" || selectedFormat === "html") ? pdfBranding : undefined,
      projectName,
      projectUrl,
    );

    toast.success(
      `Exported ${processedData.length} items as ${selectedFormat.toUpperCase()}`
    );
    onClose();
  };

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAllColumns = () => {
    setSelectedColumns(new Set(availableColumns.map((c) => c.key)));
  };

  const selectNoColumns = () => {
    setSelectedColumns(new Set());
  };

  const label = EXPORT_DATA_TYPE_LABELS[dataType] || dataType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export ${label}`}
      subtitle={`${data.length} total items available`}
      maxWidth="max-w-xl"
    >
      <div className="p-6 space-y-5">
        {/* Format selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Format
          </label>
          <div className="flex flex-wrap gap-2">
            {formats.map(({ value, label: fLabel, icon: Icon, proOnly }) => {
              const disabled = proOnly && !hasPdfReports;
              return (
                <button
                  key={value}
                  onClick={() => !disabled && setSelectedFormat(value)}
                  disabled={disabled}
                  aria-pressed={selectedFormat === value}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    selectedFormat === value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : disabled
                        ? "border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {fLabel}
                  {proOnly && !hasPdfReports && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Branding */}
        {(selectedFormat === "pdf" || selectedFormat === "html") && (
          <PdfBrandingForm onBrandingChange={handleBrandingChange} />
        )}

        {/* Filter + Sort row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Filter
            </label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {filters.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Sort By
            </label>
            <div className="flex gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Default order</option>
                {availableColumns.map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.header}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="px-2 py-2 border border-neutral-300 rounded-lg text-neutral-500 hover:bg-neutral-50 text-sm"
                title={sortDirection === "asc" ? "Ascending" : "Descending"}
              >
                {sortDirection === "asc" ? "A-Z" : "Z-A"}
              </button>
            </div>
          </div>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Limit
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={limit ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setLimit(val ? parseInt(val, 10) : null);
              }}
              placeholder="No limit"
              className="w-32 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={() => setLimit(null)}
              className={`text-sm px-2 py-1 rounded transition-colors ${
                limit === null
                  ? "text-primary font-medium"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Column picker */}
        <div>
          <button
            onClick={() => setColumnsExpanded(!columnsExpanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-neutral-700 mb-2"
          >
            <span>
              Columns ({selectedColumns.size} of {availableColumns.length} selected)
            </span>
            {columnsExpanded ? (
              <IconChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <IconChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </button>

          {columnsExpanded && (
            <div className="border border-neutral-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={selectAllColumns}
                  className="text-xs text-primary hover:underline"
                >
                  Select All
                </button>
                <span className="text-neutral-300">|</span>
                <button
                  onClick={selectNoColumns}
                  className="text-xs text-primary hover:underline"
                >
                  Select None
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {availableColumns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer hover:text-neutral-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.has(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    {col.header}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-b-2xl">
        <p className="text-sm text-neutral-500" aria-live="polite">
          {processedData.length} items, {activeColumnsArray.length} columns
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={processedData.length === 0 || activeColumnsArray.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export {selectedFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </Modal>
  );
}
