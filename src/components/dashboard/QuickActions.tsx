import Link from "next/link";
import { IconPlus, IconDownload } from "@tabler/icons-react";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/projects/new"
        className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        <IconPlus className="w-4 h-4" />
        New Project
      </Link>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        <IconDownload className="w-4 h-4" />
        View Projects
      </Link>
    </div>
  );
}
