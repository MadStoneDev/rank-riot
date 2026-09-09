"use client";

import { useState } from "react";
import { TabBar } from "@/components/redesign/TabBar";
import { SeverityDot } from "@/components/redesign/primitives";
import type { Fix } from "@/lib/fixes";

const TABS = ["Fixes", "Speed", "Content", "AEO"];

// Fixes tab of the redesigned scan report. "Fixes" shows everything, most
// severe first; the category tabs filter. Each row is a fix (a group of issues
// sharing a remedy), not a raw finding.
export function FixesView({ fixes }: { fixes: Fix[] }) {
  const [tab, setTab] = useState("Fixes");
  const visible = tab === "Fixes" ? fixes : fixes.filter((f) => f.category === tab);

  return (
    <div>
      <TabBar tabs={TABS} onChange={setTab} />
      {visible.length === 0 ? (
        <div
          style={{
            padding: "48px 0",
            textAlign: "center",
            color: "var(--rr-text-3)",
            fontSize: 13,
          }}
        >
          Nothing to fix here.
        </div>
      ) : (
        <div>
          {visible.map((fix) => (
            <FixRow key={fix.id} fix={fix} />
          ))}
        </div>
      )}
    </div>
  );
}

function FixRow({ fix }: { fix: Fix }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 12px 15px",
        borderBottom: "1px solid var(--rr-hairline)",
        flexWrap: "wrap",
      }}
    >
      <SeverityDot severity={fix.severity} />
      <div
        style={{
          flex: "0 1 330px",
          minWidth: 0,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--rr-text)",
        }}
      >
        {fix.title}
      </div>
      <div
        style={{
          flex: "1 1 240px",
          minWidth: 0,
          fontSize: 13,
          color: "var(--rr-text-2)",
        }}
      >
        {fix.impact}
      </div>
      <div
        className="rr-mono"
        style={{
          flex: "none",
          marginLeft: "auto",
          textAlign: "right",
          fontSize: 12,
          color: "var(--rr-text-3)",
        }}
      >
        {fix.effort}
      </div>
    </div>
  );
}
