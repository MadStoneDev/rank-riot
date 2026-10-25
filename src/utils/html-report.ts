import type { ExportColumn, ExportableData } from "@/types/export";
import type { PdfBranding } from "@/utils/pdf-report";
import { triggerDownload } from "@/utils/export";
import { buildHtmlReport } from "@/utils/html-report-build";

export { buildHtmlReport };

/** Client-side convenience: build the branded HTML report and download it. */
export function generateHtmlReport(
  data: ExportableData,
  columns: ExportColumn[],
  filename: string,
  branding?: PdfBranding,
  projectName?: string,
  projectUrl?: string,
): void {
  const html = buildHtmlReport(data, columns, branding, projectName, projectUrl);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".html") ? filename : `${filename}.html`);
}
