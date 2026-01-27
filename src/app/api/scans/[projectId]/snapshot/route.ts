import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Save a scan snapshot when scan completes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { scanId } = body;

    if (!scanId) {
      return NextResponse.json(
        { error: "scanId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get scan details
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .eq("project_id", projectId)
      .single();

    if (scanError || !scan) {
      return NextResponse.json(
        { error: "Scan not found" },
        { status: 404 }
      );
    }

    // Get issue counts by severity
    const { data: issues } = await supabase
      .from("issues")
      .select("severity")
      .eq("project_id", projectId)
      .eq("is_fixed", false);

    const issueCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    if (issues) {
      issues.forEach((issue) => {
        const severity = issue.severity?.toLowerCase() || "low";
        if (severity in issueCounts) {
          issueCounts[severity as keyof typeof issueCounts]++;
        }
      });
    }

    // Get page statistics
    const { count: totalPages } = await supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    const { count: indexablePages } = await supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_indexable", true);

    const { count: brokenLinks } = await supabase
      .from("page_links")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_broken", true);

    // Calculate average SEO score (simplified)
    const { data: pagesWithData } = await supabase
      .from("pages")
      .select("title, meta_description, h1s")
      .eq("project_id", projectId);

    let avgScore = 0;
    if (pagesWithData && pagesWithData.length > 0) {
      const scores = pagesWithData.map((page) => {
        let score = 100;
        if (!page.title) score -= 20;
        if (!page.meta_description) score -= 15;
        const h1Count = Array.isArray(page.h1s) ? page.h1s.length : 0;
        if (h1Count === 0) score -= 15;
        else if (h1Count > 1) score -= 5;
        return Math.max(0, score);
      });
      avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    // Create snapshot data
    const snapshotData = {
      timestamp: new Date().toISOString(),
      metrics: {
        totalPages: totalPages || 0,
        indexablePages: indexablePages || 0,
        brokenLinks: brokenLinks || 0,
        avgSeoScore: avgScore,
      },
      issues: {
        total: issueCounts.critical + issueCounts.high + issueCounts.medium + issueCounts.low,
        critical: issueCounts.critical,
        high: issueCounts.high,
        medium: issueCounts.medium,
        low: issueCounts.low,
      },
      scan: {
        id: scan.id,
        status: scan.status,
        pagesScanned: scan.pages_scanned,
        issuesFound: scan.issues_found,
        startedAt: scan.started_at,
        completedAt: scan.completed_at,
      },
    };

    // Save snapshot
    const { error: snapshotError } = await supabase
      .from("scan_snapshots")
      .insert({
        scan_id: scanId,
        snapshot_data: snapshotData,
      });

    if (snapshotError) {
      console.error("Error saving snapshot:", snapshotError);
      return NextResponse.json(
        { error: "Failed to save snapshot" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, snapshot: snapshotData });
  } catch (error) {
    console.error("Snapshot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch historical snapshots for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    const supabase = await createClient();

    // Get snapshots with scan info
    const { data: snapshots, error } = await supabase
      .from("scan_snapshots")
      .select(`
        id,
        scan_id,
        snapshot_data,
        created_at,
        scans!inner (
          project_id,
          started_at,
          completed_at
        )
      `)
      .eq("scans.project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching snapshots:", error);
      return NextResponse.json(
        { error: "Failed to fetch snapshots" },
        { status: 500 }
      );
    }

    return NextResponse.json({ snapshots: snapshots || [] });
  } catch (error) {
    console.error("Snapshot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
