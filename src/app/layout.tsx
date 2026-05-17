import "./globals.css";
import { Metadata } from "next";
import Script from "next/script";
import { Outfit, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "RankRiot - SEO Intelligence Platform",
    template: "%s | RankRiot",
  },
  description:
    "Professional SEO analysis and site auditing tools. Scan your website, identify issues, and improve your search rankings with RankRiot.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://rankriot.app"),
  openGraph: {
    type: "website",
    siteName: "RankRiot",
    title: "RankRiot - SEO Intelligence Platform",
    description:
      "Professional SEO analysis and site auditing tools for developers and marketing teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${playfairDisplay.variable} text-[var(--color-text-primary)] antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        {/* Paddle.js for payment processing — lazy loaded */}
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
