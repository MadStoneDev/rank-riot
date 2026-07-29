import { ExportColumn, ExportableData, ExportFormat } from "@/types/export";
import { generatePdfReport, PdfBranding } from "@/utils/pdf-report";
import { generateHtmlReport } from "@/utils/html-report";
import { buildCommentLine, buildGeneratorMeta } from "@/utils/export-attribution";

/**
 * Sanitize a string for use as a filename.
 * Replaces spaces with hyphens, strips special characters, lowercases,
 * and collapses multiple hyphens.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    .toLowerCase()
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

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
  columns: ExportColumn[],
  commentLine?: string,
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

  // Optional leading `# ...` attribution comment (skippable by most parsers).
  const lines = commentLine ? [commentLine, header, ...rows] : [header, ...rows];
  return lines.join("\n");
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
  columns: ExportColumn[],
  meta?: Record<string, any>,
): string {
  const mapped = data.map((row) => {
    const obj: Record<string, any> = {};
    for (const col of columns) {
      const value = row[col.key];
      obj[col.key] = col.formatter ? col.formatter(value) : value ?? null;
    }
    return obj;
  });
  // With attribution, wrap in an object carrying a machine-readable `generator`
  // block; without, keep the plain array for backward compatibility.
  if (meta) {
    return JSON.stringify({ ...meta, data: mapped }, null, 2);
  }
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
  formatter?: (value: any) => string,
  commentLine?: string,
): string {
  const body = data
    .map((row) => {
      const value = row[key];
      return formatter ? formatter(value) : (value ?? "");
    })
    .join("\n");
  return commentLine ? `${commentLine}\n${body}` : body;
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
  dataType?: string,
): void {
  switch (format) {
    case "csv": {
      const content = generateCSV(data, columns, buildCommentLine(projectName, projectUrl));
      downloadCSV(content, filename);
      break;
    }
    case "json": {
      const content = generateJSON(
        data,
        columns,
        buildGeneratorMeta(projectName, projectUrl, dataType),
      );
      downloadJSON(content, filename);
      break;
    }
    case "text": {
      const key = columns[0]?.key || "url";
      const col = columns.find((c) => c.key === key);
      const content = generatePlainText(data, key, col?.formatter, buildCommentLine(projectName, projectUrl));
      downloadPlainText(content, filename);
      break;
    }
    case "pdf":
      generatePdfReport(data, columns, filename, pdfBranding, projectName, projectUrl);
      break;
    case "html":
      generateHtmlReport(data, columns, filename, pdfBranding, projectName, projectUrl);
      break;
  }
}
