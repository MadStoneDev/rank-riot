"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { IconMoon, IconSun } from "@tabler/icons-react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`group relative cursor-pointer p-2 bg-[var(--color-surface-overlay)] shadow-sm shadow-[var(--color-surface-base)] overflow-hidden transition-all duration-300 ease-in-out`}
      aria-label="Toggle dark mode"
    >
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 group-hover:w-[140%] aspect-square bg-[var(--color-surface-hover)] rounded-full z-0 transition-all duration-300 ease-in-out`}
      ></div>

      {theme === "dark" ? (
        <IconSun
          className={`relative w-5 h-5 text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] z-50 transition-all duration-300 ease-in-out`}
        />
      ) : (
        <IconMoon
          className={`relative w-5 h-5 text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] z-50 transition-all duration-300 ease-in-out`}
        />
      )}
    </button>
  );
}
