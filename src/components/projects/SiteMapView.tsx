"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SiteMapNode, { type SiteMapNodeData } from "./SiteMapNode";
import { truncateUrl } from "@/utils/site-architecture";
import { safeHref } from "@/utils/safe-url";

interface PageNode {
  id: string;
  url: string;
  title: string | null;
  depth: number;
  inboundCount: number;
  outboundCount: number;
  isOrphan: boolean;
}

interface LinkEdge {
  source: string;
  target: string;
}

interface SiteMapViewProps {
  pages: PageNode[];
  links: LinkEdge[];
  totalPageCount: number;
}

const nodeTypes = { siteMapNode: SiteMapNode };

const COLUMN_GAP = 280;
const ROW_GAP = 60;

function buildLayout(pages: PageNode[]): Node[] {
  // Group by depth
  const byDepth = new Map<number, PageNode[]>();
  for (const page of pages) {
    const d = page.depth;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(page);
  }

  const nodes: Node[] = [];

  for (const [depth, group] of byDepth) {
    // Sort: most inbound links first within each depth
    group.sort((a, b) => b.inboundCount - a.inboundCount);

    const columnX = depth * COLUMN_GAP + 40;
    const startY = -(group.length * ROW_GAP) / 2;

    group.forEach((page, i) => {
      nodes.push({
        id: page.id,
        type: "siteMapNode",
        position: { x: columnX, y: startY + i * ROW_GAP },
        data: {
          label: page.title || truncateUrl(page.url, 30),
          url: page.url,
          depth: page.depth,
          inboundCount: page.inboundCount,
          isOrphan: page.isOrphan,
        } satisfies SiteMapNodeData,
      });
    });
  }

  return nodes;
}

function buildEdges(links: LinkEdge[]): Edge[] {
  return links.map((link, i) => ({
    id: `e-${i}`,
    source: link.source,
    target: link.target,
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 1 },
  }));
}

const DEPTH_LEGEND = [
  { label: "Homepage (0)", color: "#22c55e" },
  { label: "Shallow (1-3)", color: "#3b82f6" },
  { label: "Deep (4+)", color: "#f97316" },
  { label: "Orphan", color: "#ef4444" },
];

export default function SiteMapView({ pages, links, totalPageCount }: SiteMapViewProps) {
  const initialNodes = useMemo(() => buildLayout(pages), [pages]);
  const initialEdges = useMemo(() => buildEdges(links), [links]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const [selectedPage, setSelectedPage] = useState<PageNode | null>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const page = pages.find((p) => p.id === node.id) ?? null;
      setSelectedPage(page);
    },
    [pages],
  );

  const showLimitNotice = totalPageCount > pages.length;

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 160px)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{ background: "#12121a" }}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-[var(--color-surface-raised)]/95 rounded-lg shadow-md border border-[var(--color-border-default)] p-3 text-xs space-y-1.5 z-10">
        <div className="font-semibold text-[var(--color-text-secondary)] mb-1">Depth Legend</div>
        {DEPTH_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: item.color }}
            />
            <span className="text-[var(--color-text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Page limit notice */}
      {showLimitNotice && (
        <div className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-3 py-2 text-xs z-10">
          Showing {pages.length} of {totalPageCount} pages
        </div>
      )}

      {/* Sidebar panel */}
      {selectedPage && (
        <div className="absolute top-3 right-3 w-72 bg-[var(--color-surface-raised)] rounded-lg shadow-lg border border-[var(--color-border-default)] z-10" style={{ top: showLimitNotice ? 52 : 12 }}>
          <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Page Details</h4>
            <button
              onClick={() => setSelectedPage(null)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-lg leading-none"
            >
              &times;
            </button>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div>
              <span className="text-[var(--color-text-muted)] text-xs block">Title</span>
              <span className="text-[var(--color-text-primary)] font-medium">
                {selectedPage.title || "(untitled)"}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] text-xs block">URL</span>
              <a
                href={safeHref(selectedPage.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all text-xs"
              >
                {selectedPage.url}
              </a>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[var(--color-surface-overlay)] rounded-lg p-2">
                <div className="text-lg font-bold text-[var(--color-text-primary)]">{selectedPage.depth}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Depth</div>
              </div>
              <div className="bg-[var(--color-surface-overlay)] rounded-lg p-2">
                <div className="text-lg font-bold text-green-400">{selectedPage.inboundCount}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Inbound</div>
              </div>
              <div className="bg-[var(--color-surface-overlay)] rounded-lg p-2">
                <div className="text-lg font-bold text-[var(--color-primary)]">{selectedPage.outboundCount}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Outbound</div>
              </div>
            </div>
            {selectedPage.isOrphan && (
              <div className="bg-[var(--color-score-critical-muted)] text-[var(--color-score-critical)] text-xs rounded-lg px-3 py-2">
                This page has no inbound internal links (orphan).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
