"use client";

import { useState, useEffect, useRef } from "react";
import { IconDownload } from "@tabler/icons-react";
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

interface FloatingExportButtonProps {
  entries: ExportEntry[];
  filenamePrefix: string;
  projectName?: string;
  projectUrl?: string;
  /** CSS selector for the header export button to observe */
  headerSelector?: string;
}

export default function FloatingExportButton({
  entries,
  filenamePrefix,
  projectName,
  projectUrl,
  headerSelector = "[data-export-dropdown]",
}: FloatingExportButtonProps) {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState<ExportEntry | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Observe when the header export button scrolls out of view
  useEffect(() => {
    const target = document.querySelector(headerSelector);
    if (!target) {
      // If no header export found, don't show floating button
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [headerSelector]);

  // Click-outside handler for menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  if (!visible) return null;

  return (
    <>
      <div ref={menuRef} className="fixed bottom-20 right-6 z-40 md:bottom-8 md:right-8">
        {/* Menu */}
        {menuOpen && (
          <div className="absolute bottom-14 right-0 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 mb-2">
            {entries.map((entry) => {
              const label =
                entry.label || EXPORT_DATA_TYPE_LABELS[entry.dataType] || entry.dataType;
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

        {/* Floating button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center hover:scale-105"
          title="Export data"
        >
          <IconDownload className="w-5 h-5" />
        </button>
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
