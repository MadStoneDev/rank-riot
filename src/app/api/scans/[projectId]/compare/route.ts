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

    // Verify authentication and project ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
          totalPages: data.metrics?.totalPages ?? 0,
          totalIssues: data.issues?.total ?? issueCounts.total,
          criticalIssues: data.issues?.critical ?? issueCounts.critical,
          warningIssues: data.issues?.high != null ? (data.issues.high || 0) + (data.issues.medium || 0) : issueCounts.high + issueCounts.medium,
          brokenLinks: data.metrics?.brokenLinks ?? 0,
          avgScore: data.metrics?.avgSeoScore ?? 0,
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

    // Raw snapshot_data for both scans — carries the per-scan fingerprint set
    // we diff against (P1.1). Falls back gracefully when a scan predates it.
    const snapshotFor = async (scanId: string) => {
      const { data } = await supabase
        .from("scan_snapshots")
        .select("snapshot_data")
        .eq("scan_id", scanId)
        .single();
      return (data?.snapshot_data ?? null) as {
        issueFingerprints?: string[];
        issueTypesPresent?: string[];
        crawledPageIds?: string[];
        checkVersion?: string;
      } | null;
    };
    const [snap1, snap2] = await Promise.all([
      snapshotFor(scan1Id),
      snapshotFor(scan2Id),
    ]);

    // Orient chronologically so "fixed" always means resolved over time and
    // "new" means appeared over time, regardless of which scan the user put first.
    const scan1Time = new Date(scan1.completed_at || scan1.started_at || 0).getTime();
    const scan2Time = new Date(scan2.completed_at || scan2.started_at || 0).getTime();
    const olderSnap = scan1Time <= scan2Time ? snap1 : snap2;
    const newerSnap = scan1Time <= scan2Time ? snap2 : snap1;
    const olderScan = scan1Time <= scan2Time ? scan1 : scan2;
    const newerScan = scan1Time <= scan2Time ? scan2 : scan1;

    let changes: Record<string, number | boolean>;

    if (
      Array.isArray(olderSnap?.issueFingerprints) &&
      Array.isArray(newerSnap?.issueFingerprints)
    ) {
      // True set diff over fingerprints — fixed and new can both be non-zero,
      // and the buckets reconcile with each scan's totals.
      const olderFps = new Set(olderSnap!.issueFingerprints);
      const newerFps = new Set(newerSnap!.issueFingerprints);
      const newerTypes = new Set(newerSnap!.issueTypesPresent ?? []);
      const newerPages = Array.isArray(newerSnap!.crawledPageIds)
        ? new Set(newerSnap!.crawledPageIds)
        : null;
      const checkChanged =
        !!olderSnap!.checkVersion &&
        !!newerSnap!.checkVersion &&
        olderSnap!.checkVersion !== newerSnap!.checkVersion;

      let newIssues = 0;
      for (const fp of newerFps) if (!olderFps.has(fp)) newIssues++;

      let unchanged = 0;
      for (const fp of newerFps) if (olderFps.has(fp)) unchanged++;

      // Vanished issues (in older, not in newer): classify each.
      let fixed = 0;
      let checkRetired = 0;
      let pageGone = 0;
      for (const fp of olderFps) {
        if (newerFps.has(fp)) continue;
        const parts = fp.split(":");
        const pageId = parts[0];
        const issueType = parts[1] ?? "";
        if (checkChanged && issueType && !newerTypes.has(issueType)) {
          // The check type no longer runs/produces anything — not a real fix.
          checkRetired++;
        } else if (newerPages && pageId && !newerPages.has(pageId)) {
          // The page itself is no longer crawled — the issue didn't get fixed.
          pageGone++;
        } else {
          fixed++;
        }
      }

      // Invariant: the buckets must reconcile with each scan's total (P1.1).
      const reconciles =
        unchanged + newIssues === newerFps.size &&
        unchanged + fixed + checkRetired + pageGone === olderFps.size;

      changes = {
        newIssues,
        fixedIssues: fixed,
        checkRetiredIssues: checkRetired,
        pageGoneIssues: pageGone,
        unchangedIssues: unchanged,
        newPages: Math.max(0, metrics2.totalPages - metrics1.totalPages),
        removedPages: Math.max(0, metrics1.totalPages - metrics2.totalPages),
        approximate: false,
        reconciles,
      };
    } else {
      // Fallback for scans without fingerprint snapshots: count subtraction
      // (can't show fixed and new together — flagged approximate).
      const olderTotal = (olderScan.issues_found ??
        (olderSnap === snap1 ? metrics1.totalIssues : metrics2.totalIssues)) as number;
      const newerTotal = (newerScan.issues_found ??
        (newerSnap === snap1 ? metrics1.totalIssues : metrics2.totalIssues)) as number;
      changes = {
        newIssues: Math.max(0, newerTotal - olderTotal),
        fixedIssues: Math.max(0, olderTotal - newerTotal),
        newPages: Math.max(0, metrics2.totalPages - metrics1.totalPages),
        removedPages: Math.max(0, metrics1.totalPages - metrics2.totalPages),
        approximate: true,
      };
    }

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
