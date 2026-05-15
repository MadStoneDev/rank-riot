import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "#3b82f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="white"
          stroke="none"
        >
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
