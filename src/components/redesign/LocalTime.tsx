"use client";

import { useEffect, useState } from "react";

// Renders a UTC timestamp in the VIEWER's local timezone. Server components
// format with the server's tz (UTC on the host), while client components use
// the browser's — so the same scan showed "4:05 AM" in one place and "2:04 PM"
// in another (P1.4). Routing every timestamp through this one client component
// makes every surface agree on the viewer's local time.

type Mode = "datetime" | "date-short" | "time";

const OPTS: Record<Mode, Intl.DateTimeFormatOptions> = {
  datetime: {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  },
  "date-short": { day: "numeric", month: "short" },
  time: { hour: "numeric", minute: "2-digit" },
};

function format(iso: string, mode: Mode): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, OPTS[mode]);
}

export function LocalTime({
  iso,
  mode = "datetime",
  fallback = "—",
}: {
  iso: string | null | undefined;
  mode?: Mode;
  fallback?: string;
}) {
  // Initial value matches the server render (avoids a hydration flash); the
  // effect re-formats in the browser's tz after mount.
  const [text, setText] = useState<string>(() => (iso ? format(iso, mode) : fallback));
  useEffect(() => {
    setText(iso ? format(iso, mode) || fallback : fallback);
  }, [iso, mode, fallback]);

  return (
    <time suppressHydrationWarning dateTime={iso ?? undefined}>
      {text}
    </time>
  );
}
