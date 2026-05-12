"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

export default function QuickScanInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    // Basic URL validation
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    try {
      new URL(normalized);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const name = new URL(normalized).hostname.replace("www.", "");

      // Use the API route so subscription limits are enforced server-side
      const formData = new FormData();
      formData.append("name", name);
      formData.append("url", normalized);
      formData.append("project_type", "seo");

      const response = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      toast.success(`Project "${name}" created`);
      router.push(`/projects/${data.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <IconSearch className="absolute left-4 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL to scan (e.g. example.com)"
          className="w-full pl-12 pr-24 sm:pr-32 py-3.5 text-sm bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="absolute right-2 inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <IconLoader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Scan"
          )}
        </button>
      </div>
    </form>
  );
}
