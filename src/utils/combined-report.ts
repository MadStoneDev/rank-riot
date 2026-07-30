import JSZip from "jszip";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ExportColumn, ExportableData } from "@/types/export";
import { PdfBranding } from "@/utils/pdf-report";
import { generateCSV, triggerDownload } from "@/utils/export";
import {
  buildCommentLine,
  buildGeneratorMeta,
  RANKRIOT_NAME,
  RANKRIOT_URL,
} from "@/utils/export-attribution";

/**
 * "Export everything in one hit": bundle every dataset (all 11 export types) into
 * a single artefact — one JSON object, one HTML report, one PDF, or a ZIP of
 * per-type CSVs. Each carries RankRiot attribution.
 */

export interface CombinedDataset {
  dataType: string;
  label: string;
  columns: ExportColumn[];
  data: ExportableData;
}

export interface CombinedMeta {
  projectName?: string;
  projectUrl?: string;
}

const PRIMARY_COLOR = "#223971";
const PRIMARY_RGB: [number, number, number] = [34, 57, 113];
const ROW_ALT = "#F5F5FA";

/** Apply a dataset's column formatters to one row -> a plain object. */
function mapRow(row: Record<string, any>, columns: ExportColumn[]): Record<string, any> {
  const obj: Record<string, any> = {};
  for (const col of columns) {
    const value = row[col.key];
    obj[col.key] = col.formatter ? col.formatter(value) : value ?? null;
  }
  return obj;
}

function cellText(row: Record<string, any>, col: ExportColumn): string {
  const value = row[col.key];
  const formatted = col.formatter ? col.formatter(value) : value;
  return formatted === null || formatted === undefined ? "" : String(formatted);
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const nonEmpty = (datasets: CombinedDataset[]) => datasets.filter((d) => d.data.length > 0);

// ─── JSON: one object, all datasets ───────────────────────────────────────────
export function generateCombinedJSON(datasets: CombinedDataset[], meta: CombinedMeta): string {
  const out: Record<string, any> = {
    ...buildGeneratorMeta(meta.projectName, meta.projectUrl),
    datasets: {} as Record<string, any[]>,
  };
  for (const ds of datasets) {
    out.datasets[ds.dataType] = ds.data.map((row) => mapRow(row, ds.columns));
  }
  return JSON.stringify(out, null, 2);
}

export function downloadCombinedJSON(datasets: CombinedDataset[], meta: CombinedMeta, filename: string): void {
  const blob = new Blob([generateCombinedJSON(datasets, meta)], {
    type: "application/json;charset=utf-8;",
  });
  triggerDownload(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

// ─── CSV ZIP: one CSV per type + an attribution README ─────────────────────────
export async function downloadCombinedCsvZip(
  datasets: CombinedDataset[],
  meta: CombinedMeta,
  filename: string,
): Promise<void> {
  const zip = new JSZip();
  const comment = buildCommentLine(meta.projectName, meta.projectUrl);

  const readmeLines = [
    `${RANKRIOT_NAME} — SEO / AEO / GEO export`,
    RANKRIOT_URL,
    meta.projectName ? `Project: ${meta.projectName}` : "",
    meta.projectUrl || "",
    `Exported: ${new Date().toISOString()}`,
    "",
    "Files:",
    ...nonEmpty(datasets).map((d) => `  ${d.dataType}.csv — ${d.label} (${d.data.length} rows)`),
  ].filter(Boolean);
  zip.file("_about.txt", readmeLines.join("\n"));

  for (const ds of nonEmpty(datasets)) {
    zip.file(`${ds.dataType}.csv`, generateCSV(ds.data, ds.columns, comment));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, filename.endsWith(".zip") ? filename : `${filename}.zip`);
}

// ─── HTML: one report, a section per dataset ──────────────────────────────────
export function downloadCombinedHTML(
  datasets: CombinedDataset[],
  meta: CombinedMeta,
  branding: PdfBranding | undefined,
  filename: string,
): void {
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const title = branding?.businessName ? `${branding.businessName} — SEO Report` : "SEO Report";

  const subtitleParts: string[] = [];
  if (branding?.clientName) subtitleParts.push(`Client: ${esc(branding.clientName)}`);
  if (meta.projectName) subtitleParts.push(`Project: ${esc(meta.projectName)}`);
  if (meta.projectUrl) subtitleParts.push(esc(meta.projectUrl));
  const subtitle = subtitleParts.join("  &bull;  ");

  const logoHtml = branding?.logoBase64
    ? `<img src="${branding.logoBase64}" alt="Logo" style="height:40px;margin-right:16px;vertical-align:middle;" />`
    : "";

  const sections = nonEmpty(datasets)
    .map((ds) => {
      const headerCells = ds.columns.map((c) => `<th>${esc(c.header)}</th>`).join("");
      const rows = ds.data
        .map((row, i) => {
          const bg = i % 2 === 1 ? ` style="background:${ROW_ALT}"` : "";
          const cells = ds.columns.map((c) => `<td>${esc(cellText(row, c))}</td>`).join("");
          return `<tr${bg}>${cells}</tr>`;
        })
        .join("\n");
      return `<section>
  <h2>${esc(ds.label)} <span class="count">${ds.data.length}</span></h2>
  <div class="table-wrapper"><table><thead><tr>${headerCells}</tr></thead><tbody>
${rows}
  </tbody></table></div>
</section>`;
    })
    .join("\n");

  const toc = nonEmpty(datasets)
    .map((ds) => `<li>${esc(ds.label)} <span class="count">${ds.data.length}</span></li>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="generator" content="${RANKRIOT_NAME} (${RANKRIOT_URL})" />
<title>${esc(title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; background: #fff; }
  .header { background: ${PRIMARY_COLOR}; color: #fff; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { display: flex; align-items: center; }
  .header-title { font-size: 20px; font-weight: 700; }
  .header-subtitle { font-size: 13px; opacity: 0.85; margin-top: 4px; }
  .header-date { font-size: 13px; opacity: 0.85; text-align: right; }
  .toc { padding: 20px 32px 0; }
  .toc h3 { font-size: 14px; color: #666; margin-bottom: 8px; }
  .toc ul { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; }
  .toc li { font-size: 13px; background: ${ROW_ALT}; padding: 4px 10px; border-radius: 6px; }
  .count { color: #888; font-size: 12px; }
  section { padding: 20px 32px; }
  h2 { font-size: 16px; color: ${PRIMARY_COLOR}; margin-bottom: 12px; border-bottom: 2px solid ${ROW_ALT}; padding-bottom: 6px; }
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: ${PRIMARY_COLOR}; color: #fff; text-align: left; padding: 8px 10px; font-weight: 600; white-space: nowrap; }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e5e5; word-break: break-word; max-width: 360px; }
  .footer { padding: 16px 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e5e5; margin-top: 16px; }
  @media print {
    .header, th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    section { break-inside: avoid; }
    body { font-size: 10px; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">${logoHtml}<div><div class="header-title">${esc(title)}</div>${subtitle ? `<div class="header-subtitle">${subtitle}</div>` : ""}</div></div>
    <div class="header-date">${esc(dateStr)}</div>
  </div>
  <div class="toc"><h3>Contents</h3><ul>${toc}</ul></div>
${sections}
  <div class="footer">Generated by <a href="${RANKRIOT_URL}" style="color:inherit;font-weight:600;">${RANKRIOT_NAME}</a> &mdash; ${esc(dateStr)}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".html") ? filename : `${filename}.html`);
}

// ─── PDF: one document, a table per dataset ───────────────────────────────────
export function downloadCombinedPDF(
  datasets: CombinedDataset[],
  meta: CombinedMeta,
  branding: PdfBranding | undefined,
  filename: string,
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cover header bar
  doc.setFillColor(...PRIMARY_RGB);
  doc.rect(0, 0, pageWidth, 28, "F");
  let leftX = 14;
  if (branding?.logoBase64) {
    try {
      doc.addImage(branding.logoBase64, "PNG", leftX, 4, 20, 20);
      leftX = 38;
    } catch {
      /* ignore bad image */
    }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(branding?.businessName ? `${branding.businessName} — SEO Report` : "SEO Report", leftX, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subtitleParts: string[] = [];
  if (branding?.clientName) subtitleParts.push(`Client: ${branding.clientName}`);
  if (meta.projectName) subtitleParts.push(`Project: ${meta.projectName}`);
  if (meta.projectUrl) subtitleParts.push(meta.projectUrl);
  if (subtitleParts.length) doc.text(subtitleParts.join("  •  "), leftX, 18);
  doc.setFontSize(9);
  doc.text(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    pageWidth - 14,
    12,
    { align: "right" },
  );

  let startY = 34;
  for (const ds of nonEmpty(datasets)) {
    // Section heading
    doc.setTextColor(...PRIMARY_RGB);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    if (startY > pageHeight - 30) {
      doc.addPage();
      startY = 20;
    }
    doc.text(`${ds.label} (${ds.data.length})`, 10, startY);

    autoTable(doc, {
      startY: startY + 3,
      head: [ds.columns.map((c) => c.header)],
      body: ds.data.map((row) => ds.columns.map((c) => cellText(row, c))),
      styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak", lineWidth: 0.1 },
      headStyles: { fillColor: PRIMARY_RGB, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      margin: { left: 10, right: 10 },
    });

    startY = (doc as any).lastAutoTable.finalY + 12;
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    doc.text(`Generated by ${RANKRIOT_NAME} (${RANKRIOT_URL})`, pageWidth - 10, pageHeight - 8, { align: "right" });
  }

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
