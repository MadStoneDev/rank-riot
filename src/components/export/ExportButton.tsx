"use client";

import { useState } from "react";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import { ExportColumn, ExportableData } from "@/types/export";
import { exportToCSV } from "@/utils/export";

interface ExportButtonProps {
  data: ExportableData;
  columns: ExportColumn[];
  filename: string;
  label?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function ExportButton({
  data,
  columns,
  filename,
  label = "Export CSV",
  variant = "secondary",
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting || data.length === 0) return;

    setIsExporting(true);

    try {
      // Small delay for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 100));
      exportToCSV(data, columns, filename);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const baseClasses =
    "inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? "border border-transparent shadow-sm text-white bg-primary hover:bg-primary/90"
      : "border border-neutral-300 shadow-sm text-neutral-700 bg-white hover:bg-neutral-50";

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting || data.length === 0}
      className={`${baseClasses} ${variantClasses}`}
      title={data.length === 0 ? "No data to export" : `Export ${data.length} rows`}
    >
      {isExporting ? (
        <IconLoader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <IconDownload className="h-4 w-4 mr-1" />
      )}
      {label}
    </button>
  );
}
