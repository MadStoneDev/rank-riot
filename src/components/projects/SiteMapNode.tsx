"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface SiteMapNodeData {
  label: string;
  url: string;
  depth: number;
  inboundCount: number;
  isOrphan: boolean;
  [key: string]: unknown;
}

const DEPTH_COLORS: Record<number, string> = {
  0: "#22c55e",  // green — homepage
  1: "#3b82f6",  // blue
  2: "#3b82f6",
  3: "#3b82f6",
};
const DEEP_COLOR = "#f97316"; // orange — depth 4+

function getColor(depth: number): string {
  return DEPTH_COLORS[depth] ?? DEEP_COLOR;
}

function SiteMapNode({ data }: NodeProps) {
  const nodeData = data as unknown as SiteMapNodeData;
  const { label, depth, inboundCount, isOrphan } = nodeData;

  const bg = getColor(depth);
  const borderColor = isOrphan ? "#ef4444" : depth >= 4 ? "#f97316" : bg;
  const borderWidth = isOrphan ? 3 : 2;

  // Size proportional to inbound links (min 120, max 220)
  const width = Math.min(220, Math.max(120, 120 + inboundCount * 8));

  return (
    <div
      style={{
        width,
        background: "#fff",
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 11,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: bg }} />

      <div
        style={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#1a1a2e",
        }}
        title={label}
      >
        {label}
      </div>

      {/* Inbound count badge */}
      <div
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          background: bg,
          color: "#fff",
          fontSize: 9,
          fontWeight: 700,
          borderRadius: "50%",
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {inboundCount}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: bg }} />
    </div>
  );
}

export default memo(SiteMapNode);
