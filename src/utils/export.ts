import { ExportColumn, ExportableData } from "@/types/export";

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
export function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate CSV content from data and column configuration
 */
export function generateCSV(
  data: ExportableData,
  columns: ExportColumn[]
): string {
  // Header row
  const header = columns.map((col) => escapeCSVValue(col.header)).join(",");

  // Data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        const formattedValue = col.formatter ? col.formatter(value) : value;
        return escapeCSVValue(formattedValue);
      })
      .join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Download CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file (convenience function)
 */
export function exportToCSV(
  data: ExportableData,
  columns: ExportColumn[],
  filename: string
): void {
  const csvContent = generateCSV(data, columns);
  downloadCSV(csvContent, filename);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Format boolean for export
 */
export function formatBooleanForExport(value: boolean | null): string {
  if (value === null || value === undefined) return "";
  return value ? "Yes" : "No";
}
