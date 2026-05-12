import Link from "next/link";
import { IconPlus, IconDownload } from "@tabler/icons-react";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/projects/new"
        className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <IconPlus className="w-4 h-4" />
        New Project
      </Link>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <IconDownload className="w-4 h-4" />
        View Projects
      </Link>
    </div>
  );
}
