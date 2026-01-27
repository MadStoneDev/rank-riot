import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const scan1Id = searchParams.get("scan1");
    const scan2Id = searchParams.get("scan2");

    if (!scan1Id || !scan2Id) {
      return NextResponse.json(
        { error: "Both scan1 and scan2 parameters are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get both scans
    const { data: scans, error: scansError } = await supabase
      .from("scans")
      .select("*")
      .eq("project_id", projectId)
      .in("id", [scan1Id, scan2Id]);

    if (scansError || !scans || scans.length !== 2) {
      return NextResponse.json(
        { error: "Scans not found" },
        { status: 404 }
      );
    }

    const scan1 = scans.find((s) => s.id === scan1Id)!;
    const scan2 = scans.find((s) => s.id === scan2Id)!;

    // Helper function to get metrics for a specific point in time
    const getMetricsForScan = async (scanId: string) => {
      // Get issues at time of scan
      const { data: issues } = await supabase
        .from("issues")
        .select("severity, scan_id")
        .eq("project_id", projectId)
        .eq("scan_id", scanId);

      const issueCounts = {
        total: issues?.length || 0,
        critical: issues?.filter((i) => i.severity === "critical").length || 0,
        high: issues?.filter((i) => i.severity === "high").length || 0,
        medium: issues?.filter((i) => i.severity === "medium").length || 0,
        low: issues?.filter((i) => i.severity === "low").length || 0,
      };

      // Try to get snapshot data if available
      const { data: snapshot } = await supabase
        .from("scan_snapshots")
        .select("snapshot_data")
        .eq("scan_id", scanId)
        .single();

      if (snapshot?.snapshot_data) {
        const data = snapshot.snapshot_data as any;
        return {
          totalPages: data.metrics?.totalPages || 0,
          totalIssues: data.issues?.total || issueCounts.total,
          criticalIssues: data.issues?.critical || issueCounts.critical,
          warningIssues: (data.issues?.high || 0) + (data.issues?.medium || 0) || issueCounts.high + issueCounts.medium,
          brokenLinks: data.metrics?.brokenLinks || 0,
          avgScore: data.metrics?.avgSeoScore || 0,
        };
      }

      // Fallback to scan data
      const scan = scans.find((s) => s.id === scanId)!;
      return {
        totalPages: scan.pages_scanned || 0,
        totalIssues: scan.issues_found || issueCounts.total,
        criticalIssues: issueCounts.critical,
        warningIssues: issueCounts.high + issueCounts.medium,
        brokenLinks: 0,
        avgScore: 0,
      };
    };

    const metrics1 = await getMetricsForScan(scan1Id);
    const metrics2 = await getMetricsForScan(scan2Id);

    // Calculate changes
    const changes = {
      newIssues: Math.max(0, metrics2.totalIssues - metrics1.totalIssues),
      fixedIssues: Math.max(0, metrics1.totalIssues - metrics2.totalIssues),
      newPages: Math.max(0, metrics2.totalPages - metrics1.totalPages),
      removedPages: Math.max(0, metrics1.totalPages - metrics2.totalPages),
    };

    const comparison = {
      scan1: {
        id: scan1Id,
        date: scan1.started_at,
        metrics: metrics1,
      },
      scan2: {
        id: scan2Id,
        date: scan2.started_at,
        metrics: metrics2,
      },
      changes,
    };

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error("Comparison API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
