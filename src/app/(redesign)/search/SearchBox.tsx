"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Search input for the global page search. Navigates to /search?q=… on submit.
export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      }}
      style={{ position: "relative", maxWidth: 520 }}
    >
      <Search
        size={16}
        strokeWidth={1.5}
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--rr-text-3)",
          pointerEvents: "none",
        }}
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search pages by title or URL"
        autoFocus
        style={{
          width: "100%",
          height: 40,
          padding: "0 12px 0 36px",
          borderRadius: 8,
          border: "1px solid var(--rr-border)",
          background: "var(--rr-surface)",
          color: "var(--rr-text)",
          fontSize: 14,
        }}
      />
    </form>
  );
}
