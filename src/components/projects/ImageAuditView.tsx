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
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back to {projectName}
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Image Audit</h1>
          <p className="text-neutral-500 mt-1">
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
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Preview</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Alt Text</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginated.map((img, idx) => (
                <tr key={`${img.imageSrc}-${idx}`} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded bg-neutral-100 flex items-center justify-center overflow-hidden">
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
                        <IconPhoto className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-neutral-600 truncate max-w-xs" title={img.imageSrc}>
                      {img.imageSrc}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {img.hasAlt ? (
                      <span className="text-sm text-neutral-700">{img.alt}</span>
                    ) : (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-neutral-500 truncate max-w-xs" title={img.pageUrl}>
                      {img.pageUrl}
                    </p>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-neutral-500">
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
