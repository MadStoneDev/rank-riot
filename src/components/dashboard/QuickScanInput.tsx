"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      // Create project
      const name = new URL(normalized).hostname.replace("www.", "");
      const { data: project, error } = await supabase
        .from("projects")
        .insert({ name, url: normalized, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Project "${name}" created`);
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <IconSearch className="absolute left-4 w-5 h-5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL to scan (e.g. example.com)"
          className="w-full pl-12 pr-24 sm:pr-32 py-4 text-sm border border-neutral-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="absolute right-2 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
