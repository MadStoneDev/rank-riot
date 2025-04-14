"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      setTheme(theme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`cursor-pointer p-2 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors`}
    >
      {theme === "dark" ? (
        <IconSun className="w-5 h-5" />
      ) : (
        <IconMoon className="w-5 h-5" />
      )}
    </button>
  );
}
