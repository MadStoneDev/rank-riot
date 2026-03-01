"use client";

import { useState } from "react";
import { IconDownload } from "@tabler/icons-react";
import ExportModal from "@/components/export/ExportModal";
import { ExportDataType, ExportFormat, ExportableData } from "@/types/export";

interface ExportTriggerButtonProps {
  dataType: ExportDataType;
  data: ExportableData;
  filenamePrefix: string;
  projectName?: string;
  projectUrl?: string;
  label?: string;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  disabled?: boolean;
  allowedFormats?: ExportFormat[];
}

export default function ExportTriggerButton({
  dataType,
  data,
  filenamePrefix,
  projectName,
  projectUrl,
  label = "Export",
  variant = "secondary",
  icon,
  disabled = false,
  allowedFormats,
}: ExportTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const baseClasses =
    "inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? "border border-transparent shadow-sm text-white bg-primary hover:bg-primary/90"
      : "border border-neutral-300 shadow-sm text-neutral-700 bg-white hover:bg-neutral-50";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled || data.length === 0}
        className={`${baseClasses} ${variantClasses}`}
        title={data.length === 0 ? "No data to export" : `Export ${data.length} items`}
      >
        {icon || <IconDownload className="h-4 w-4 mr-1" />}
        {label}
      </button>

      <ExportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        dataType={dataType}
        data={data}
        filenamePrefix={filenamePrefix}
        projectName={projectName}
        projectUrl={projectUrl}
        allowedFormats={allowedFormats}
      />
    </>
  );
}
