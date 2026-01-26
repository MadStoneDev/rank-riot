export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

export interface ExportConfig {
  filename: string;
  columns: ExportColumn[];
}

export type ExportableData = Record<string, any>[];

// Pre-configured export configurations
export const PAGES_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "url", header: "URL" },
  { key: "title", header: "Title" },
  { key: "meta_description", header: "Meta Description" },
  { key: "word_count", header: "Word Count" },
  { key: "http_status", header: "HTTP Status" },
  { key: "load_time_ms", header: "Load Time (ms)" },
  { key: "depth", header: "Depth" },
  { key: "is_indexable", header: "Indexable" },
];

export const ISSUES_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "page_url", header: "Page URL" },
  { key: "issue_type", header: "Issue Type" },
  { key: "severity", header: "Severity" },
  { key: "description", header: "Description" },
  { key: "created_at", header: "Created At" },
];
