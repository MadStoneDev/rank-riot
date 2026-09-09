import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

// The exception-based redesign uses IBM Plex Sans (400/600 only) for prose and
// IBM Plex Mono for paths, numbers, timestamps and labels. Scoped to the
// redesign surfaces via CSS variables, so it does not affect the current app.
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
