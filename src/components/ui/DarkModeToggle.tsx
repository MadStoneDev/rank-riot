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
      className={`group relative cursor-pointer p-2 bg-neutral-100 dark:bg-primary shadow-sm shadow-neutral-300 dark:shadow-neutral-900 overflow-hidden transition-all duration-300 ease-in-out`}
      aria-label="Toggle dark mode"
    >
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 group-hover:w-[140%] aspect-square bg-primary dark:bg-neutral-50 rounded-full z-0 transition-all duration-300 ease-in-out`}
      ></div>

      {theme === "dark" ? (
        <IconSun
          className={`relative w-5 h-5 text-primary group-hover:text-neutral-50 dark:text-neutral-50 dark:group-hover:text-primary z-50 transition-all duration-300 ease-in-out`}
        />
      ) : (
        <IconMoon
          className={`relative w-5 h-5 text-primary group-hover:text-neutral-50 dark:text-neutral-50 dark:group-hover:text-primary z-50 transition-all duration-300 ease-in-out`}
        />
      )}
    </button>
  );
}
