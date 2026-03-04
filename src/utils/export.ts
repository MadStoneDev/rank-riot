import { ExportColumn, ExportableData, ExportFormat } from "@/types/export";
import { toast } from "sonner";
import { generatePdfReport, PdfBranding } from "@/utils/pdf-report";

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
 * Trigger a file download from a Blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
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

/**
 * Generate JSON string from data and column configuration
 */
export function generateJSON(
  data: ExportableData,
  columns: ExportColumn[]
): string {
  const mapped = data.map((row) => {
    const obj: Record<string, any> = {};
    for (const col of columns) {
      const value = row[col.key];
      obj[col.key] = col.formatter ? col.formatter(value) : value ?? null;
    }
    return obj;
  });
  return JSON.stringify(mapped, null, 2);
}

/**
 * Download JSON content as a file
 */
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

/**
 * Export data to JSON file (convenience function)
 */
export function exportToJSON(
  data: ExportableData,
  columns: ExportColumn[],
  filename: string
): void {
  const jsonContent = generateJSON(data, columns);
  downloadJSON(jsonContent, filename);
}

/**
 * Generate plain text — one value per line from a single column key
 */
export function generatePlainText(
  data: ExportableData,
  key: string,
  formatter?: (value: any) => string
): string {
  return data
    .map((row) => {
      const value = row[key];
      return formatter ? formatter(value) : (value ?? "");
    })
    .join("\n");
}

/**
 * Download plain text content as a file
 */
export function downloadPlainText(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".txt") ? filename : `${filename}.txt`);
}

/**
 * Export data to plain text file (convenience function)
 */
export function exportToPlainText(
  data: ExportableData,
  key: string,
  filename: string,
  formatter?: (value: any) => string
): void {
  const textContent = generatePlainText(data, key, formatter);
  downloadPlainText(textContent, filename);
}

/**
 * Dispatch export based on format
 */
export function executeExport(
  format: ExportFormat,
  data: ExportableData,
  columns: ExportColumn[],
  filename: string,
  pdfBranding?: PdfBranding,
  projectName?: string,
  projectUrl?: string,
): void {
  switch (format) {
    case "csv":
      exportToCSV(data, columns, filename);
      break;
    case "json":
      exportToJSON(data, columns, filename);
      break;
    case "text": {
      const key = columns[0]?.key || "url";
      const col = columns.find((c) => c.key === key);
      exportToPlainText(data, key, filename, col?.formatter);
      break;
    }
    case "pdf":
      generatePdfReport(data, columns, filename, pdfBranding, projectName, projectUrl);
      break;
    case "html":
      toast.info("HTML reports are coming soon.");
      break;
  }
}
