import type { CSSProperties, ReactNode } from "react";

// Presentational primitives for the exception-based redesign. Stateless, so
// they render on the server; the only interactive primitive (TabBar) lives in
// its own client file. All colours come from the `.rr` token scope.

export type Severity = "critical" | "warning" | "low" | "clean";

const SEV_INK: Record<Severity, string> = {
  critical: "var(--rr-crit)",
  warning: "var(--rr-warn)",
  low: "var(--rr-sev-low)",
  clean: "var(--rr-sev-clean)",
};

export function SeverityDot({
  severity = "clean",
  size = 7,
}: {
  severity?: Severity;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: SEV_INK[severity],
        flex: "none",
        display: "inline-block",
      }}
    />
  );
}

// Outlined chip naming a fault. Severity ink on a severity-tinted border, no
// fill. Absent entirely when a page is fine — never render a "clean" flag.
export function Flag({
  severity = "critical",
  children,
}: {
  severity?: "critical" | "warning" | "low";
  children: ReactNode;
}) {
  const ink = SEV_INK[severity];
  return (
    <span
      style={{
        height: 22,
        display: "inline-flex",
        alignItems: "center",
        padding: "0 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        color: ink,
        border: `1px solid color-mix(in srgb, ${ink} 38%, transparent)`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// The ONLY bordered container in the system. Never nest one inside another.
export function MetricCard({
  label,
  value,
  delta,
  deltaTone = "muted",
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "positive" | "critical" | "muted";
}) {
  const deltaColor =
    deltaTone === "positive"
      ? "var(--rr-pos)"
      : deltaTone === "critical"
        ? "var(--rr-crit)"
        : "var(--rr-text-3)";
  return (
    <div
      style={{
        border: "1px solid var(--rr-border)",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 132,
      }}
    >
      <div
        className="rr-mono"
        style={{
          fontSize: 11,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--rr-text-3)",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div
          className="rr-mono"
          style={{
            fontSize: 30,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        {delta && (
          <div className="rr-mono" style={{ fontSize: 12, color: deltaColor }}>
            {delta}
          </div>
        )}
      </div>
    </div>
  );
}

export function MetricStrip({ children }: { children: ReactNode }) {
  return <div className="rr-metric-strip">{children}</div>;
}

// Loading placeholder: a flat surface block at text height, no shimmer.
// Uses surface-raised so it resolves in both light and dark.
export function Skeleton({
  width = "100%",
  height = 12,
  radius = 4,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        borderRadius: radius,
        background: "var(--rr-surface-raised)",
        flex: "none",
      }}
    />
  );
}

// Hairline-separated row — never a card. Slots: primary, secondary, metrics,
// flags. The whole row is the tap target when `href` is set.
export function Row({
  primary,
  secondary,
  metrics,
  flags,
  href,
  style,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  metrics?: ReactNode;
  flags?: ReactNode;
  href?: string;
  style?: CSSProperties;
}) {
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 0",
        borderTop: "1px solid var(--rr-hairline)",
        minHeight: 46,
        ...style,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--rr-text)",
          }}
        >
          {primary}
        </div>
        {secondary && (
          <div
            className="rr-mono"
            style={{
              fontSize: 12,
              color: "var(--rr-text-3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {secondary}
          </div>
        )}
      </div>
      {flags && (
        <div style={{ display: "flex", gap: 6, flex: "none" }}>{flags}</div>
      )}
      {metrics && (
        <div
          className="rr-mono"
          style={{
            display: "flex",
            gap: 16,
            flex: "none",
            fontSize: 13,
            color: "var(--rr-text-2)",
          }}
        >
          {metrics}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ display: "block", color: "inherit" }}>
        {inner}
      </a>
    );
  }
  return inner;
}

// Single indigo primary action per screen.
export function PrimaryButton({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <button
      style={{
        height: 36,
        padding: "0 16px",
        borderRadius: 7,
        background: "var(--rr-accent)",
        color: "var(--rr-accent-ink)",
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
