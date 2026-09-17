"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import {
  DisclosureSection,
  DetailRow,
} from "@/components/redesign/DisclosureSection";
import type { Section } from "@/lib/page-detail-sections";

interface Detail {
  id: string;
  title: string;
  url: string;
  path: string;
  score: number;
  sections: Section[];
}

// Screen 4 as a 620px desktop slide-over over the dimmed pages list. The list
// stays mounted behind it — context is never destroyed. Below 1080 the Pages
// tab navigates to the full-screen detail route instead of opening this.
export function PageDetailPanel({
  projectId,
  pageId,
  onClose,
}: {
  projectId: string;
  pageId: string | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

  // Fetch on open.
  useEffect(() => {
    if (!pageId) {
      setDetail(null);
      return;
    }
    let active = true;
    setLoading(true);
    setDetail(null);
    fetch(`/api/projects/${projectId}/pages/${pageId}/detail`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) setDetail(d);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, pageId]);

  // Slide-in + Escape to close.
  useEffect(() => {
    if (!pageId) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [pageId, onClose]);

  if (!pageId) return null;

  return (
    <>
      {/* Click-catcher (transparent — the list behind is already dimmed). */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 50 }}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Page detail"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 620,
          maxWidth: "100vw",
          zIndex: 51,
          background: "var(--rr-surface)",
          borderLeft: "1px solid var(--rr-border)",
          transform: entered ? "translateX(0)" : "translateX(100%)",
          transition: "transform 180ms cubic-bezier(.2,.8,.25,1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {loading || !detail ? (
          <PanelSkeleton onClose={onClose} />
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                padding: "22px 28px 18px",
                borderBottom: "1px solid var(--rr-hairline-strong)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <h2
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 19,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                    margin: 0,
                    textWrap: "pretty",
                  }}
                >
                  {detail.title}
                </h2>
                <span
                  className="rr-mono"
                  style={{ fontSize: 24, fontWeight: 600, lineHeight: 1, flex: "none" }}
                >
                  {detail.score}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    flex: "none",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--rr-text-3)",
                    display: "flex",
                  }}
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <span
                  className="rr-mono"
                  style={{
                    fontSize: 12,
                    color: "var(--rr-text-3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                >
                  {detail.path}
                </span>
                <div style={{ display: "flex", gap: 10, flex: "none" }}>
                  <a
                    href={detail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      height: 28,
                      padding: "0 12px",
                      border: "1px solid var(--rr-border-button)",
                      borderRadius: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: "var(--rr-text)",
                      textDecoration: "none",
                    }}
                  >
                    Open live
                    <ExternalLink size={13} strokeWidth={1.5} />
                  </a>
                  <a
                    href={`/projects/${projectId}/fixes`}
                    style={{
                      height: 28,
                      padding: "0 12px",
                      background: "var(--rr-accent)",
                      color: "var(--rr-accent-ink)",
                      borderRadius: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Open fix
                  </a>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div style={{ padding: "0 28px 40px" }}>
              {detail.sections.map((s) => (
                <DisclosureSection
                  key={s.key}
                  severity={s.severity}
                  name={s.name}
                  summary={s.summary}
                  problemCount={s.problemCount}
                >
                  {s.rows.map((r, i) => (
                    <DetailRow
                      key={i}
                      label={r.label}
                      value={r.value}
                      tone={r.tone}
                      mono={r.mono}
                    />
                  ))}
                </DisclosureSection>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function PanelSkeleton({ onClose }: { onClose: () => void }) {
  const block = (w: number | string, h: number) => (
    <div style={{ width: w, height: h, background: "#16181d", borderRadius: 4 }} />
  );
  return (
    <div style={{ padding: "22px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {block("60%", 20)}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rr-text-3)", display: "flex" }}
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {block("40%", 13)}
        {block("100%", 44)}
        {block("100%", 44)}
        {block("100%", 44)}
      </div>
    </div>
  );
}
