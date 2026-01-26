"use client";

import {
  IconPhoto,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
} from "@tabler/icons-react";

interface ImageOverviewCardProps {
  totalImages: number;
  imagesWithAlt: number;
  imagesMissingAlt: number;
  altCoveragePercent: number;
}

export default function ImageOverviewCard({
  totalImages,
  imagesWithAlt,
  imagesMissingAlt,
  altCoveragePercent,
}: ImageOverviewCardProps) {
  if (totalImages === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <IconPhoto className="h-5 w-5" />
          <span className="font-medium">No Images Found</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          No images detected on crawled pages
        </p>
      </div>
    );
  }

  const getStatusColor = () => {
    if (altCoveragePercent >= 90) return "green";
    if (altCoveragePercent >= 70) return "orange";
    return "red";
  };

  const statusColor = getStatusColor();
  const borderColor =
    statusColor === "green"
      ? "border-green-200"
      : statusColor === "orange"
        ? "border-orange-200"
        : "border-red-200";
  const bgColor =
    statusColor === "green"
      ? "bg-green-50"
      : statusColor === "orange"
        ? "bg-orange-50"
        : "bg-red-50";
  const textColor =
    statusColor === "green"
      ? "text-green-900"
      : statusColor === "orange"
        ? "text-orange-900"
        : "text-red-900";
  const progressColor =
    statusColor === "green"
      ? "bg-green-500"
      : statusColor === "orange"
        ? "bg-orange-500"
        : "bg-red-500";

  const StatusIcon =
    statusColor === "green"
      ? IconCircleCheck
      : statusColor === "orange"
        ? IconAlertTriangle
        : IconAlertCircle;

  return (
    <div className={`bg-white rounded-lg border ${borderColor} overflow-hidden`}>
      <div className={`px-4 py-3 ${bgColor} border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <IconPhoto className={`h-5 w-5 ${textColor.replace("900", "600")}`} />
          <span className={`font-medium ${textColor}`}>Image Overview</span>
        </div>
        <p className={`mt-1 text-sm ${textColor.replace("900", "700")}`}>
          Alt text accessibility analysis
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-neutral-900">{totalImages}</p>
            <p className="text-sm text-neutral-500">Total Images</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon
              className={`h-8 w-8 ${textColor.replace("900", "500")}`}
            />
            <div className="text-right">
              <p className={`text-2xl font-bold ${textColor}`}>
                {altCoveragePercent}%
              </p>
              <p className="text-xs text-neutral-500">Alt Coverage</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} rounded-full transition-all`}
              style={{ width: `${altCoveragePercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-700">{imagesWithAlt}</p>
            <p className="text-xs text-green-600">With Alt Text</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-xl font-bold text-red-700">{imagesMissingAlt}</p>
            <p className="text-xs text-red-600">Missing Alt Text</p>
          </div>
        </div>
      </div>
    </div>
  );
}
