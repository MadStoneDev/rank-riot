import { ExportColumn, ExportableData } from "@/types/export";

// Pure, DOM-free export formatters (CSV / JSON / plain text) + filename helpers.
// Split out of export.ts so server code (the export API route) can build files
// without importing the browser-only download helpers or jsPDF.

/**
 * Sanitize a string for use as a filename: spaces→hyphens, strip specials,
 * lowercase, collapse hyphens.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    .toLowerCase()
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/** Escape a value for CSV (commas, quotes, newlines). */
export function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
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

/** Generate CSV content from data and column configuration. */
export function generateCSV(
  data: ExportableData,
  columns: ExportColumn[],
  commentLine?: string,
): string {
  const header = columns.map((col) => escapeCSVValue(col.header)).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        const formattedValue = col.formatter ? col.formatter(value) : value;
        return escapeCSVValue(formattedValue);
      })
      .join(","),
  );
  const lines = commentLine ? [escapeCSVValue(commentLine), header, ...rows] : [header, ...rows];
  return lines.join("\n");
}

/** Generate a JSON string from data and column configuration. */
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
  if (meta) return JSON.stringify({ ...meta, data: mapped }, null, 2);
  return JSON.stringify(mapped, null, 2);
}

/** Generate plain text — one value per line from a single column key. */
export function generatePlainText(
  data: ExportableData,
  key: string,
  formatter?: (value: any) => string,
  commentLine?: string,
): string {
  const body = data
    .map((row) => {
      const value = row[key];
      return formatter ? formatter(value) : value ?? "";
    })
    .join("\n");
  return commentLine ? `${commentLine}\n${body}` : body;
}

/** Format date for export (YYYY-MM-DD). */
export function formatDateForExport(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/** Format boolean for export (Yes/No). */
export function formatBooleanForExport(value: boolean | null): string {
  if (value === null || value === undefined) return "";
  return value ? "Yes" : "No";
}
