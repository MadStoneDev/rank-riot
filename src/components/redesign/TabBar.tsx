"use client";

import { useState } from "react";

// Text tabs, 2px accent underline on the active one; horizontally scrollable on
// phone. Presentation-only (tracks its own active tab) for the design preview;
// screens will lift selection into their own state/routing.
export function TabBar({
  tabs,
  initial,
  onChange,
}: {
  tabs: string[];
  initial?: string;
  onChange?: (tab: string) => void;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]);
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        borderBottom: "1px solid var(--rr-hairline)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => {
              setActive(t);
              onChange?.(t);
            }}
            style={{
              padding: "10px 0",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--rr-text)" : "var(--rr-text-2)",
              borderBottom: `2px solid ${isActive ? "var(--rr-accent)" : "transparent"}`,
              background: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
