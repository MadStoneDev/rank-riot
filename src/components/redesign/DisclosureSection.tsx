"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { SeverityDot, type Severity } from "@/components/redesign/primitives";

// Progressive-disclosure section for the page-detail screen. Collapsed it is a
// single row — dot, name, one-line summary, chevron. It is expanded by default
// only when it holds a problem (critical or warning). A clean section shows a
// factual summary, never a green tick or the word "Passed".
export function DisclosureSection({
  severity,
  name,
  summary,
  problemCount,
  children,
  defaultOpen,
}: {
  severity: Severity;
  name: string;
  summary: string;
  problemCount?: number;
  children?: ReactNode;
  defaultOpen?: boolean;
}) {
  const initiallyOpen =
    defaultOpen ?? (severity === "critical" || severity === "warning");
  const [open, setOpen] = useState(initiallyOpen);
  const hasBody = !!children;

  return (
    <div style={{ borderBottom: "1px solid #1b1e23" }}>
      <button
        onClick={() => hasBody && setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 0",
          background: "none",
          border: "none",
          cursor: hasBody ? "pointer" : "default",
          textAlign: "left",
          color: "inherit",
        }}
      >
        <SeverityDot severity={severity} />
        <span style={{ fontSize: 14, fontWeight: 600, flex: "none" }}>
          {name}
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            color: "var(--rr-text-2)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {summary}
        </span>
        {problemCount && problemCount > 0 ? (
          <span
            style={{
              flex: "none",
              fontSize: 12,
              color:
                severity === "critical" ? "var(--rr-crit)" : "var(--rr-warn)",
            }}
          >
            {problemCount} {problemCount === 1 ? "problem" : "problems"}
          </span>
        ) : null}
        {hasBody && !open && (
          <ChevronRight
            size={14}
            strokeWidth={1.5}
            style={{ flex: "none", color: "var(--rr-text-3)" }}
          />
        )}
      </button>
      {open && hasBody && (
        <div style={{ padding: "0 0 14px 19px", display: "flex", flexDirection: "column", gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// One label/value line inside an expanded section. Problem values render in
// severity ink; clean values render in mono secondary.
export function DetailRow({
  label,
  value,
  tone = "clean",
  mono,
}: {
  label: string;
  value: ReactNode;
  tone?: "critical" | "warning" | "clean";
  mono?: boolean;
}) {
  const color =
    tone === "critical"
      ? "var(--rr-crit)"
      : tone === "warning"
        ? "var(--rr-warn)"
        : "var(--rr-text-2)";
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
      <span
        style={{
          flex: "none",
          width: 120,
          fontSize: 13,
          color: "var(--rr-text-2)",
        }}
      >
        {label}
      </span>
      <span
        className={mono ? "rr-mono" : undefined}
        style={{ flex: 1, minWidth: 0, fontSize: 13, color, textWrap: "pretty" }}
      >
        {value}
      </span>
    </div>
  );
}
