"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCode,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
} from "@tabler/icons-react";
import Pagination from "@/components/ui/Pagination";
import ExportTriggerButton from "@/components/export/ExportTriggerButton";
import { sanitizeFilename } from "@/utils/export";

interface SchemaPage {
  id: string;
  url: string;
  title: string | null;
  schema_types: string[] | null;
  structured_data: any;
  open_graph: any;
  twitter_card: any;
}

interface SchemaAuditViewProps {
  pages: SchemaPage[];
  projectId: string;
  projectName: string;
}

type SchemaFilter = "all" | "has-schema" | "no-schema" | string;

export default function SchemaAuditView({ pages, projectId, projectName }: SchemaAuditViewProps) {
  const [filter, setFilter] = useState<SchemaFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Stats
  const pagesWithSchema = pages.filter(
    (p) => p.schema_types && p.schema_types.length > 0,
  );
  const pagesWithOG = pages.filter(
    (p) => p.open_graph && Object.keys(p.open_graph).length > 0,
  );

  // Collect all unique schema types
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    pages.forEach((p) => (p.schema_types || []).forEach((t) => types.add(t)));
    return Array.from(types).sort();
  }, [pages]);

  const schemaPercent = pages.length > 0 ? Math.round((pagesWithSchema.length / pages.length) * 100) : 0;
  const ogPercent = pages.length > 0 ? Math.round((pagesWithOG.length / pages.length) * 100) : 0;

  // Filter
  const filtered = useMemo(() => {
    if (filter === "has-schema") return pagesWithSchema;
    if (filter === "no-schema") return pages.filter((p) => !p.schema_types || p.schema_types.length === 0);
    if (filter !== "all") return pages.filter((p) => (p.schema_types || []).includes(filter));
    return pages;
  }, [pages, filter, pagesWithSchema]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back to {projectName}
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Schema & Structured Data</h1>
          <p className="text-neutral-500 mt-1">
            {pages.length} pages analyzed &middot; {pagesWithSchema.length} with schema
          </p>
        </div>
        <ExportTriggerButton
          dataType="schema-data"
          data={pages}
          filenamePrefix={sanitizeFilename(projectName)}
          projectName={projectName}
          label="Export Schema"
          icon={<IconDownload className="w-4 h-4" />}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm text-neutral-500">Pages with Schema</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{schemaPercent}%</p>
          <p className="text-xs text-neutral-400 mt-1">{pagesWithSchema.length} of {pages.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm text-neutral-500">Open Graph Coverage</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{ogPercent}%</p>
          <p className="text-xs text-neutral-400 mt-1">{pagesWithOG.length} of {pages.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm text-neutral-500">Schema Types Found</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{allTypes.length}</p>
          <p className="text-xs text-neutral-400 mt-1 truncate">{allTypes.slice(0, 3).join(", ") || "None"}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          ["all", `All (${pages.length})`],
          ["has-schema", `Has Schema (${pagesWithSchema.length})`],
          ["no-schema", `No Schema (${pages.length - pagesWithSchema.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === key
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {label}
          </button>
        ))}
        {allTypes.map((type) => (
          <button
            key={type}
            onClick={() => { setFilter(type); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === type
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600 w-8"></th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">URL</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Schema Types</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">OG</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Twitter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginated.map((p) => {
                const hasSchema = p.schema_types && p.schema_types.length > 0;
                const hasOG = p.open_graph && Object.keys(p.open_graph).length > 0;
                const hasTwitter = p.twitter_card && Object.keys(p.twitter_card).length > 0;
                const isExpanded = expandedRows.has(p.id);

                return (
                  <tr key={p.id} className="hover:bg-neutral-50 group">
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRow(p.id)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          {isExpanded ? (
                            <IconChevronUp className="w-4 h-4" />
                          ) : (
                            <IconChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 items-center">
                          <p className="text-xs text-neutral-600 truncate" title={p.url}>
                            {p.url}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {hasSchema ? (
                              (p.schema_types || []).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium"
                                >
                                  {t}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-neutral-400">None</span>
                            )}
                          </div>
                          <span className={`text-xs ${hasOG ? "text-green-600" : "text-neutral-400"}`}>
                            {hasOG ? "Yes" : "No"}
                          </span>
                          <span className={`text-xs ${hasTwitter ? "text-green-600" : "text-neutral-400"}`}>
                            {hasTwitter ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 ml-6 p-3 bg-neutral-50 rounded-lg text-xs space-y-2">
                          {hasSchema && (
                            <div>
                              <p className="font-medium text-neutral-700 mb-1">Structured Data</p>
                              <pre className="bg-white p-2 rounded border text-[11px] overflow-auto max-h-48 text-neutral-600">
                                {JSON.stringify(p.structured_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {hasOG && (
                            <div>
                              <p className="font-medium text-neutral-700 mb-1">Open Graph</p>
                              <pre className="bg-white p-2 rounded border text-[11px] overflow-auto max-h-32 text-neutral-600">
                                {JSON.stringify(p.open_graph, null, 2)}
                              </pre>
                            </div>
                          )}
                          {hasTwitter && (
                            <div>
                              <p className="font-medium text-neutral-700 mb-1">Twitter Card</p>
                              <pre className="bg-white p-2 rounded border text-[11px] overflow-auto max-h-32 text-neutral-600">
                                {JSON.stringify(p.twitter_card, null, 2)}
                              </pre>
                            </div>
                          )}
                          {!hasSchema && !hasOG && !hasTwitter && (
                            <p className="text-neutral-400">No structured data found for this page.</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                    No pages match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      )}
    </div>
  );
}
