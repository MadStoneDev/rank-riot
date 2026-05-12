"use client";

import dynamic from "next/dynamic";

const SiteMapView = dynamic(
  () => import("@/components/projects/SiteMapView"),
  { ssr: false },
);

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

interface SiteMapViewLazyProps {
  pages: PageNode[];
  links: LinkEdge[];
  totalPageCount: number;
}

export default function SiteMapViewLazy(props: SiteMapViewLazyProps) {
  return <SiteMapView {...props} />;
}
