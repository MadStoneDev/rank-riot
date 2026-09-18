"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Dark is primary; light is opt-in. Toggles data-mode on the `.rr` root (which
// the token scope reads) and persists to localStorage. The layout also applies
// the saved mode via an inline script pre-hydration, so there's no flash.
function applyMode(mode: "dark" | "light") {
  const root = document.querySelector(".rr");
  if (!root) return;
  if (mode === "light") root.setAttribute("data-mode", "light");
  else root.removeAttribute("data-mode");
}

export function ThemeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("rr-mode");
    } catch {
      /* storage blocked */
    }
    const initial = saved === "light" ? "light" : "dark";
    setMode(initial);
    applyMode(initial);
  }, []);

  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    applyMode(next);
    try {
      localStorage.setItem("rr-mode", next);
    } catch {
      /* storage blocked */
    }
  };

  const Icon = mode === "light" ? Moon : Sun;
  const label = mode === "light" ? "Dark mode" : "Light mode";

  return (
    <button
      onClick={toggle}
      className="rr-nav-row"
      title={label}
      style={{
        width: "100%",
        height: 32,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 8px",
        borderRadius: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--rr-text-2)",
        fontSize: 13,
        textAlign: "left",
      }}
    >
      <Icon size={16} strokeWidth={1.5} />
      <span className="rr-nav-label">{label}</span>
    </button>
  );
}
