"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPhoto,
  IconDownload,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import Pagination from "@/components/ui/Pagination";
import ExportTriggerButton from "@/components/export/ExportTriggerButton";
import { sanitizeFilename } from "@/utils/export";
import { safeHref } from "@/utils/safe-url";
import ViewToggle, { ImageViewMode } from "@/components/ui/ViewToggle";

interface ImageRow {
  pageUrl: string;
  pageTitle: string;
  pageId: string;
  imageSrc: string;
  alt: string;
  hasAlt: boolean;
  fileSizeBytes?: number | null;
}

interface ImageAuditViewProps {
  images: ImageRow[];
  projectId: string;
  projectName: string;
}

type FilterMode = "all" | "missing-alt" | "has-alt";
type SortKey = "source" | "alt" | "size" | "page";
type SortDir = "asc" | "desc";

function formatBytes(bytes?: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageAuditView({ images, projectId, projectName }: ImageAuditViewProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [viewMode, setViewMode] = useState<ImageViewMode>("list");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Size is most useful largest-first; text columns default A→Z.
      setSortDir(key === "size" ? "desc" : "asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (filter === "missing-alt") return images.filter((i) => !i.hasAlt);
    if (filter === "has-alt") return images.filter((i) => i.hasAlt);
    return images;
  }, [images, filter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "size":
          // Unknown sizes sort to the bottom regardless of direction.
          cmp = (a.fileSizeBytes ?? -1) - (b.fileSizeBytes ?? -1);
          break;
        case "alt":
          cmp = Number(a.hasAlt) - Number(b.hasAlt);
          break;
        case "source":
          cmp = a.imageSrc.localeCompare(b.imageSrc);
          break;
        case "page":
          cmp = a.pageUrl.localeCompare(b.pageUrl);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const missingCount = images.filter((i) => !i.hasAlt).length;
  const hasAltCount = images.length - missingCount;

  const SortTh = ({ label, colKey }: { label: string; colKey: SortKey }) => (
    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">
      <button
        onClick={() => toggleSort(colKey)}
        className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors"
      >
        {label}
        {sortKey === colKey ? (
          sortDir === "asc" ? (
            <IconChevronUp className="h-3 w-3" />
          ) : (
            <IconChevronDown className="h-3 w-3" />
          )
        ) : (
          <IconSelector className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] mb-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back to {projectName}
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Image Audit</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {images.length} images found &middot; {missingCount} missing alt text
          </p>
        </div>
        <ExportTriggerButton
          dataType="images-alt"
          data={images}
          filenamePrefix={sanitizeFilename(projectName)}
          projectName={projectName}
          label="Export Images"
          icon={<IconDownload className="w-4 h-4" />}
        />
      </div>

      {/* Filter tabs + view toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {([
            ["all", `All (${images.length})`],
            ["missing-alt", `Missing Alt (${missingCount})`],
            ["has-alt", `Has Alt (${hasAltCount})`],
          ] as [FilterMode, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filter === key
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Grid view has no column headers, so offer an explicit sort there. */}
          {viewMode === "grid" && (
            <select
              value={sortKey ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setSortKey(null);
                } else {
                  setSortKey(v as SortKey);
                  setSortDir(v === "size" ? "desc" : "asc");
                }
                setPage(1);
              }}
              className="text-sm rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)] px-2 py-1.5"
              aria-label="Sort images"
            >
              <option value="">Sort: Default</option>
              <option value="size">Size (largest)</option>
              <option value="alt">Alt status</option>
              <option value="source">Source</option>
              <option value="page">Page</option>
            </select>
          )}
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" ? (
        paginated.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map((img, idx) => (
              <div
                key={`${img.imageSrc}-${idx}`}
                className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border-default)] overflow-hidden"
              >
                <div className="aspect-video relative bg-[var(--color-surface-overlay)] overflow-hidden">
                  {img.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={safeHref(img.imageSrc, "")}
                      alt={img.alt || ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconPhoto className="w-6 h-6 text-[var(--color-text-muted)]" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {img.hasAlt ? (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--color-score-good)] text-white text-xs font-medium">Alt</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--color-score-critical)] text-white text-xs font-medium">No alt</span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[var(--color-text-secondary)] truncate" title={img.imageSrc}>
                      {img.imageSrc.split("/").pop() || img.imageSrc}
                    </p>
                    <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap flex-shrink-0">
                      {formatBytes(img.fileSizeBytes)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5" title={img.pageUrl}>
                    {img.pageUrl}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] px-4 py-12 text-center text-[var(--color-text-muted)]">
            No images match the current filter.
          </div>
        )
      ) : (
      /* Table */
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-surface-overlay)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Preview</th>
                <SortTh label="Source" colKey="source" />
                <SortTh label="Alt Text" colKey="alt" />
                <SortTh label="Size" colKey="size" />
                <SortTh label="Page" colKey="page" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {paginated.map((img, idx) => (
                <tr key={`${img.imageSrc}-${idx}`} className="hover:bg-[var(--color-surface-hover)]">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded bg-[var(--color-surface-overlay)] flex items-center justify-center overflow-hidden">
                      {img.imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={safeHref(img.imageSrc, "")}
                          alt={img.alt || ""}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <IconPhoto className="w-5 h-5 text-[var(--color-text-muted)]" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-xs" title={img.imageSrc}>
                      {img.imageSrc}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {img.hasAlt ? (
                      <span className="text-sm text-[var(--color-text-secondary)]">{img.alt}</span>
                    ) : (
                      <span className="text-xs font-medium text-[var(--color-score-critical)] bg-[var(--color-score-critical-muted)] px-2 py-0.5 rounded">
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {formatBytes(img.fileSizeBytes)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[var(--color-text-muted)] truncate max-w-xs" title={img.pageUrl}>
                      {img.pageUrl}
                    </p>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--color-text-muted)]">
                    No images match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

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
