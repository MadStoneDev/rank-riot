import { Skeleton, MetricStrip } from "@/components/redesign/primitives";

// Shared loading fallback for every redesign route. Rendered inside the layout,
// so the sidebar/bottom nav stay put and only the content area streams in.
// Blocks at text height, no shimmer (per the design system).
export default function RedesignLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "0 32px",
          height: 64,
          borderBottom: "1px solid var(--rr-hairline)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Skeleton width={160} height={18} />
          <Skeleton width={120} height={12} />
        </div>
        <Skeleton width={92} height={34} radius={7} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 26, padding: "18px 32px 12px" }}>
        {[44, 46, 52, 60, 40, 56].map((w, i) => (
          <Skeleton key={i} width={w} height={13} />
        ))}
      </div>

      {/* Metric strip */}
      <div style={{ padding: "8px 32px 0" }}>
        <MetricStrip>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--rr-border)",
                borderRadius: 10,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 132,
              }}
            >
              <Skeleton width={70} height={10} />
              <Skeleton width={54} height={26} />
            </div>
          ))}
        </MetricStrip>
      </div>

      {/* Rows */}
      <div style={{ padding: "24px 32px 0" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 12px",
              borderBottom: "1px solid var(--rr-hairline)",
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width={`${40 + ((i * 7) % 45)}%`} height={14} />
              <Skeleton width={`${25 + ((i * 5) % 30)}%`} height={11} />
            </div>
            <Skeleton width={64} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}
