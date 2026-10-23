import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { ExportDataType, ExportFormat } from "@/types/export";
import { EXPORT_COLUMN_REGISTRY, EXPORT_FILTERS } from "@/types/export";
import type { PdfBranding } from "@/utils/pdf-report";
import { buildDataset } from "@/lib/server/export-datasets";
import {
  generateCSV,
  generateJSON,
  generatePlainText,
  sanitizeFilename,
} from "@/utils/export-format";
import { buildHtmlReport } from "@/utils/html-report-build";
import { renderPdfReport } from "@/utils/pdf-report-server";
import { buildCommentLine, buildGeneratorMeta } from "@/utils/export-attribution";
import { hasPdfReports, toPlanId } from "@/lib/subscription-limits";

// react-pdf needs the Node runtime.
export const runtime = "nodejs";

const VALID_FORMATS: ExportFormat[] = ["csv", "json", "text", "pdf", "html"];

// Server-side export generation (F-E01/E02): builds a dataset server-side with
// paginated reads, enforces the PDF/HTML plan entitlement on the server (not a
// cosmetic client gate), and returns the finished file. The browser only
// downloads the response, so a large project can't OOM the tab and a free user
// can't bypass the gate by calling a client generator.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const dataType = body.dataType as ExportDataType;
  const format = body.format as ExportFormat;
  if (!dataType || !(dataType in EXPORT_COLUMN_REGISTRY)) {
    return NextResponse.json({ error: "Unknown dataType" }, { status: 400 });
  }
  if (!format || !VALID_FORMATS.includes(format)) {
    return NextResponse.json({ error: "Unknown format" }, { status: 400 });
  }
  const columnKeys = Array.isArray(body.columnKeys)
    ? (body.columnKeys as unknown[]).filter((k): k is string => typeof k === "string")
    : undefined;
  const filterKey = typeof body.filterKey === "string" ? (body.filterKey as string) : undefined;
  const branding = (body.branding ?? undefined) as PdfBranding | undefined;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Entitlement: PDF/HTML reports are a paid feature — enforced here on the
  // server so it can't be bypassed from the client (F-E01).
  if (format === "pdf" || format === "html") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();
    if (!hasPdfReports(toPlanId(profile?.subscription_tier))) {
      return NextResponse.json(
        { error: "PDF/HTML reports require a Pro plan or higher." },
        { status: 403 },
      );
    }
  }

  // Columns: the caller's selection (preserving registry order + duplicates,
  // e.g. redirects' two redirect_chain views), else the dataset's defaults.
  const allCols = EXPORT_COLUMN_REGISTRY[dataType];
  const columns =
    columnKeys && columnKeys.length > 0
      ? allCols.filter((c) => columnKeys.includes(c.key))
      : allCols.filter((c) => c.defaultSelected);
  if (columns.length === 0) {
    return NextResponse.json({ error: "No columns selected" }, { status: 400 });
  }

  let rows = await buildDataset(supabase, projectId, dataType);
  if (filterKey) {
    const f = EXPORT_FILTERS[dataType]?.find((x) => x.key === filterKey);
    if (f) rows = rows.filter(f.predicate);
  }

  // Optional sort + limit (parity with the client modal's controls).
  const sortBy = typeof body.sortBy === "string" ? (body.sortBy as string) : "";
  const sortDir = body.sortDirection === "desc" ? "desc" : "asc";
  if (sortBy) {
    rows = [...rows].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }
  const limit = typeof body.limit === "number" && body.limit > 0 ? Math.floor(body.limit) : null;
  if (limit) rows = rows.slice(0, limit);

  const projectName = project.name as string;
  const projectUrl = (project.url as string | null) ?? undefined;
  const base = sanitizeFilename(`${projectName}-${dataType}`) || "export";

  let payload: string | Buffer;
  let contentType: string;
  let ext: string;
  switch (format) {
    case "csv":
      payload = "﻿" + generateCSV(rows, columns, buildCommentLine(projectName, projectUrl));
      contentType = "text/csv;charset=utf-8";
      ext = "csv";
      break;
    case "json":
      payload = generateJSON(rows, columns, buildGeneratorMeta(projectName, projectUrl, dataType));
      contentType = "application/json;charset=utf-8";
      ext = "json";
      break;
    case "text": {
      const key = columns[0]?.key || "url";
      const col = columns.find((c) => c.key === key);
      payload = generatePlainText(rows, key, col?.formatter, buildCommentLine(projectName, projectUrl));
      contentType = "text/plain;charset=utf-8";
      ext = "txt";
      break;
    }
    case "html":
      payload = buildHtmlReport(rows, columns, branding, projectName, projectUrl);
      contentType = "text/html;charset=utf-8";
      ext = "html";
      break;
    case "pdf":
      payload = await renderPdfReport(rows, columns, branding, projectName, projectUrl);
      contentType = "application/pdf";
      ext = "pdf";
      break;
    default:
      return NextResponse.json({ error: "Unknown format" }, { status: 400 });
  }

  const bytes = typeof payload === "string" ? new TextEncoder().encode(payload) : new Uint8Array(payload);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${base}.${ext}"`,
      "Cache-Control": "no-store",
    },
  });
}
