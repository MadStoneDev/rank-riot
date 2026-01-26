"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconExternalLink,
  IconAlertTriangle,
  IconCheck,
  IconPhoto,
} from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import Pagination from "@/components/ui/Pagination";

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
      <div className="group relative bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 hover:border-primary transition-colors">
        {/* Thumbnail */}
        <div className="aspect-video relative bg-neutral-100 overflow-hidden">
          {!imgError ? (
            <img
              src={image.src}
              alt={image.alt || "Image preview"}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <IconPhoto className="h-8 w-8" />
            </div>
          )}

          {/* Alt text status badge */}
          <div className="absolute top-2 right-2">
            {hasAlt ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/90 text-white text-xs">
                <IconCheck className="h-3 w-3" />
                Alt
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/90 text-white text-xs">
                <IconAlertTriangle className="h-3 w-3" />
                No Alt
              </span>
            )}
          </div>

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a
              href={image.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 bg-white rounded text-sm font-medium text-neutral-900 hover:bg-neutral-100"
            >
              <IconExternalLink className="h-4 w-4" />
              View Full
            </a>
          </div>
        </div>

        {/* Image info */}
        <div className="p-3">
          <p className="text-xs text-neutral-500 truncate mb-1" title={image.src}>
            {image.src.split("/").pop() || image.src}
          </p>
          {hasAlt ? (
            <p className="text-sm text-neutral-700 line-clamp-2" title={image.alt}>
              {image.alt}
            </p>
          ) : (
            <p className="text-sm text-red-500 italic">Missing alt text</p>
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
          <span className="text-sm text-neutral-500">
            {images.length} image{images.length !== 1 ? "s" : ""}
          </span>
          {missingAltCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
              {missingAltCount} missing alt
            </span>
          )}
        </div>
      }
    >
      {images.length > 0 ? (
        <>
          {/* Filter toggle */}
          {missingAltCount > 0 && (
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyMissingAlt}
                  onChange={(e) => {
                    setShowOnlyMissingAlt(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-600">
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
        <div className="p-8 text-center text-neutral-500">
          No images found on this page
        </div>
      )}
    </CollapsibleSection>
  );
}
