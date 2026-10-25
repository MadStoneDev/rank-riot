import { ExportColumn, ExportableData, ExportFormat } from "@/types/export";
import { generatePdfReport, PdfBranding } from "@/utils/pdf-report";
import { generateHtmlReport } from "@/utils/html-report";
import { buildCommentLine, buildGeneratorMeta } from "@/utils/export-attribution";
import {
  sanitizeFilename,
  escapeCSVValue,
  generateCSV,
  generateJSON,
  generatePlainText,
  formatDateForExport,
  formatBooleanForExport,
} from "@/utils/export-format";

// The pure formatters now live in export-format.ts (DOM-free, server-usable);
// re-exported here so existing `@/utils/export` importers are unaffected.
export {
  sanitizeFilename,
  escapeCSVValue,
  generateCSV,
  generateJSON,
  generatePlainText,
  formatDateForExport,
  formatBooleanForExport,
};

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
