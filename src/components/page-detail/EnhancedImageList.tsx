"use client";

import { useState } from "react";
import {
  IconExternalLink,
  IconAlertTriangle,
  IconCheck,
  IconPhoto,
} from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import { safeHref } from "@/utils/safe-url";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";

interface ImageData {
  src: string;
  alt: string;
}

interface EnhancedImageListProps {
  images: ImageData[];
}

export default function EnhancedImageList({
  images = [],
}: EnhancedImageListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [showOnlyMissingAlt, setShowOnlyMissingAlt] = useState(false);

  const missingAltCount = images.filter(
    (img) => !img.alt || img.alt.trim() === ""
  ).length;

  const filteredImages = showOnlyMissingAlt
    ? images.filter((img) => !img.alt || img.alt.trim() === "")
    : images;

  const totalPages = Math.ceil(filteredImages.length / pageSize);
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const ImageCard = ({
    image,
    index,
  }: {
    image: ImageData;
    index: number;
  }) => {
    const [imgError, setImgError] = useState(false);
    const hasAlt = image.alt && image.alt.trim() !== "";

    return (
      <div className="group relative bg-[var(--color-surface-overlay)] rounded-lg overflow-hidden border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] transition-colors">
        {/* Thumbnail */}
        <div className="aspect-video relative bg-[var(--color-surface-elevated)] overflow-hidden">
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={safeHref(image.src, "")}
              alt={image.alt || "Image preview"}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
              <IconPhoto className="h-8 w-8" />
            </div>
          )}

          {/* Alt text status badge */}
          <div className="absolute top-2 right-2">
            {hasAlt ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-score-good)] text-white text-xs font-medium">
                <IconCheck className="h-3 w-3" />
                Alt
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-score-critical)] text-white text-xs font-medium">
                <IconAlertTriangle className="h-3 w-3" />
                No Alt
              </span>
            )}
          </div>

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a
              href={safeHref(image.src)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 bg-[var(--color-surface-raised)] rounded text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)]"
            >
              <IconExternalLink className="h-4 w-4" />
              View Full
            </a>
          </div>
        </div>

        {/* Image info */}
        <div className="p-3">
          <p className="text-xs text-[var(--color-text-muted)] truncate mb-1" title={image.src}>
            {image.src.split("/").pop() || image.src}
          </p>
          {hasAlt ? (
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2" title={image.alt}>
              {image.alt}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-score-critical)] italic">Missing alt text</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <CollapsibleSection
      title="Images"
      badge={
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">
            {images.length} image{images.length !== 1 ? "s" : ""}
          </span>
          {missingAltCount > 0 && (
            <Badge variant="critical">
              {missingAltCount} missing alt
            </Badge>
          )}
        </div>
      }
    >
      {images.length > 0 ? (
        <>
          {/* Filter toggle */}
          {missingAltCount > 0 && (
            <div className="px-4 py-3 bg-[var(--color-surface-overlay)] border-b border-[var(--color-border-subtle)]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyMissingAlt}
                  onChange={(e) => {
                    setShowOnlyMissingAlt(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Show only images missing alt text ({missingAltCount})
                </span>
              </label>
            </div>
          )}

          {/* Image grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedImages.map((image, index) => (
                <ImageCard key={index} image={image} index={index} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {filteredImages.length > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[12, 24, 48]}
            />
          )}
        </>
      ) : (
        <div className="p-8 text-center text-[var(--color-text-muted)]">
          No images found on this page
        </div>
      )}
    </CollapsibleSection>
  );
}
