import { ImageResponse } from "next/og";

// Default social share card for every route that doesn't define its own.
export const alt = "RankRiot — SEO Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1120 0%, #111827 55%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>RankRiot</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Technical SEO analysis without the complexity
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#94a3b8", maxWidth: 940 }}>
          Site audits, AEO/GEO readiness scoring, and actionable insights.
        </div>
      </div>
    ),
    { ...size }
  );
}
