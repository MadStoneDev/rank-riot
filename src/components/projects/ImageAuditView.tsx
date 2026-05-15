"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { IconArrowLeft, IconPhoto, IconDownload } from "@tabler/icons-react";
import Pagination from "@/components/ui/Pagination";
import ExportTriggerButton from "@/components/export/ExportTriggerButton";
import { sanitizeFilename } from "@/utils/export";
import { safeHref } from "@/utils/safe-url";

interface ImageRow {
  pageUrl: string;
  pageTitle: string;
  pageId: string;
  imageSrc: string;
  alt: string;
  hasAlt: boolean;
}

interface ImageAuditViewProps {
  images: ImageRow[];
  projectId: string;
  projectName: string;
}

type FilterMode = "all" | "missing-alt" | "has-alt";

export default function ImageAuditView({ images, projectId, projectName }: ImageAuditViewProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo(() => {
    if (filter === "missing-alt") return images.filter((i) => !i.hasAlt);
    if (filter === "has-alt") return images.filter((i) => i.hasAlt);
    return images;
  }, [images, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const missingCount = images.filter((i) => !i.hasAlt).length;
  const hasAltCount = images.length - missingCount;

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

      {/* Filter tabs */}
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

      {/* Table */}
      <div className="bg-[var(--color-surface-raised)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-surface-overlay)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Preview</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Source</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Alt Text</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Page</th>
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
                  <td className="px-4 py-3">
                    <p className="text-xs text-[var(--color-text-muted)] truncate max-w-xs" title={img.pageUrl}>
                      {img.pageUrl}
                    </p>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[var(--color-text-muted)]">
                    No images match the current filter.
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
