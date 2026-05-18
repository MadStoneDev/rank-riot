"use client";

import { useState, useTransition } from "react";
import { IconDeviceFloppy, IconCheck, IconX } from "@tabler/icons-react";

interface ProjectEditorProps {
  projectId: string;
  initialName: string;
  initialUrl: string;
  initialScanFrequency: string;
}

export default function ProjectEditor({
  projectId,
  initialName,
  initialUrl,
  initialScanFrequency,
}: ProjectEditorProps) {
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState(initialUrl);
  const [scanFrequency, setScanFrequency] = useState(
    initialScanFrequency || "manual",
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const hasChanges =
    name !== initialName ||
    url !== initialUrl ||
    scanFrequency !== (initialScanFrequency || "manual");

  async function handleSave() {
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_project",
            projectId,
            updates: { name, url, scan_frequency: scanFrequency },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setFeedback({
            type: "error",
            message: data.error || "Failed to save",
          });
          return;
        }

        setFeedback({ type: "success", message: "Project updated" });
        setTimeout(() => setFeedback(null), 3000);
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Network error",
        });
      }
    });
  }

  const inputClass =
    "w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-colors";

  return (
    <div className="glass-card p-5">
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        Project Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">
            Scan Frequency
          </label>
          <select
            value={scanFrequency}
            onChange={(e) => setScanFrequency(e.target.value)}
            className={inputClass}
          >
            <option value="manual">Manual</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <IconDeviceFloppy className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Changes"}
        </button>

        {feedback && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              feedback.type === "success"
                ? "text-[var(--color-score-good)]"
                : "text-[var(--color-score-critical)]"
            }`}
          >
            {feedback.type === "success" ? (
              <IconCheck className="h-3.5 w-3.5" />
            ) : (
              <IconX className="h-3.5 w-3.5" />
            )}
            {feedback.message}
          </span>
        )}
      </div>
    </div>
  );
}
