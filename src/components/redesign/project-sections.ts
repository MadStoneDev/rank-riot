import { type ComponentType } from "react";
import {
  ListChecks,
  FileText,
  Gauge,
  AlignLeft,
  Sparkles,
  History,
  Network,
  ImageIcon,
  Braces,
  GitCompare,
  Settings,
} from "lucide-react";

// The ONE canonical list of project report sections (F-R06). Both the sidebar's
// project children and the in-page ReportTabs render from this, so neither can
// omit a section the other has — previously Speed/Content/AEO/History were
// reachable only via the tabs and Sitemap/Images/Schema/Compare only via the
// sidebar, so the active section often highlighted in neither. Order is the IA:
// report views, then tools, then settings.
export type ProjectSection = {
  key: string;
  label: string;
  // URL suffix under /projects/[projectId]/… (route groups like (tools) don't
  // affect the path).
  path: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

export const PROJECT_SECTIONS: ProjectSection[] = [
  { key: "fixes", label: "Fixes", path: "fixes", icon: ListChecks },
  { key: "pages", label: "Pages", path: "pages-redesign", icon: FileText },
  { key: "speed", label: "Speed", path: "speed", icon: Gauge },
  { key: "content", label: "Content", path: "content", icon: AlignLeft },
  { key: "aeo", label: "AEO", path: "aeo", icon: Sparkles },
  { key: "history", label: "History", path: "history", icon: History },
  { key: "sitemap", label: "Sitemap", path: "sitemap", icon: Network },
  { key: "images", label: "Images", path: "images", icon: ImageIcon },
  { key: "schema", label: "Schema", path: "schema", icon: Braces },
  { key: "compare", label: "Compare", path: "compare", icon: GitCompare },
  { key: "settings", label: "Settings", path: "settings-redesign", icon: Settings },
];

export function sectionHref(projectId: string, section: ProjectSection): string {
  return `/projects/${projectId}/${section.path}`;
}
