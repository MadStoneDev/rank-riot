"use client";

import {
  IconClock,
  IconFileDescription,
  IconLetterCase,
  IconServer,
} from "@tabler/icons-react";

interface TechnicalMetricsProps {
  page: {
    http_status?: number | null;
    load_time_ms?: number | null;
    first_byte_time_ms?: number | null;
    size_bytes?: number | null;
    word_count?: number | null;
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function TechnicalMetrics({ page }: TechnicalMetricsProps) {
  const getHttpStatusColor = (status?: number | null) => {
    if (!status) return "bg-neutral-100 text-neutral-600";
    if (status >= 200 && status < 300) return "bg-green-100 text-green-700";
    if (status >= 300 && status < 400) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  const getLoadTimeColor = (ms?: number | null) => {
    if (!ms) return "text-neutral-600";
    if (ms < 1000) return "text-green-600";
    if (ms < 3000) return "text-orange-500";
    return "text-red-600";
  };

  const MetricItem = ({
    icon,
    label,
    value,
    valueClass,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueClass?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-2 text-neutral-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${valueClass || "text-neutral-900"}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-900">
          Technical Metrics
        </h3>
      </div>
      <div className="px-6 py-2">
        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-neutral-600">
            <IconServer className="h-4 w-4" />
            <span className="text-sm">HTTP Status</span>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getHttpStatusColor(page.http_status)}`}
          >
            {page.http_status || "Unknown"}
          </span>
        </div>
        <MetricItem
          icon={<IconClock className="h-4 w-4" />}
          label="Load Time"
          value={page.load_time_ms ? formatTime(page.load_time_ms) : "N/A"}
          valueClass={getLoadTimeColor(page.load_time_ms)}
        />
        <MetricItem
          icon={<IconClock className="h-4 w-4" />}
          label="First Byte (TTFB)"
          value={
            page.first_byte_time_ms
              ? formatTime(page.first_byte_time_ms)
              : "N/A"
          }
          valueClass={getLoadTimeColor(page.first_byte_time_ms)}
        />
        <MetricItem
          icon={<IconFileDescription className="h-4 w-4" />}
          label="Page Size"
          value={page.size_bytes ? formatBytes(page.size_bytes) : "N/A"}
        />
        <MetricItem
          icon={<IconLetterCase className="h-4 w-4" />}
          label="Word Count"
          value={
            page.word_count ? page.word_count.toLocaleString() : "N/A"
          }
        />
      </div>
    </div>
  );
}
