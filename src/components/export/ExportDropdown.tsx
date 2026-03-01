"use client";

import { useState, useRef, useEffect } from "react";
import { IconDownload, IconChevronDown } from "@tabler/icons-react";
import ExportModal from "@/components/export/ExportModal";
import {
  ExportDataType,
  ExportableData,
  EXPORT_DATA_TYPE_LABELS,
} from "@/types/export";

interface ExportEntry {
  dataType: ExportDataType;
  data: ExportableData;
  label?: string;
}

interface ExportDropdownProps {
  entries: ExportEntry[];
  filenamePrefix: string;
  projectName?: string;
  projectUrl?: string;
}

export default function ExportDropdown({
  entries,
  filenamePrefix,
  projectName,
  projectUrl,
}: ExportDropdownProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState<ExportEntry | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md border border-neutral-300 shadow-sm text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <IconDownload className="h-4 w-4 mr-1" />
          Export
          <IconChevronDown className="h-3.5 w-3.5 ml-1" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg z-40 py-1">
            {entries.map((entry) => {
              const label =
                entry.label ||
                EXPORT_DATA_TYPE_LABELS[entry.dataType] ||
                entry.dataType;
              const count = entry.data.length;
              return (
                <button
                  key={entry.dataType}
                  onClick={() => {
                    setModalEntry(entry);
                    setMenuOpen(false);
                  }}
                  disabled={count === 0}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed flex justify-between items-center"
                >
                  <span>{label}</span>
                  <span className="text-xs text-neutral-400">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {modalEntry && (
        <ExportModal
          isOpen={true}
          onClose={() => setModalEntry(null)}
          dataType={modalEntry.dataType}
          data={modalEntry.data}
          filenamePrefix={filenamePrefix}
          projectName={projectName}
          projectUrl={projectUrl}
        />
      )}
    </>
  );
}
