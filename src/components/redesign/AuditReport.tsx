"use client";

import { scoreTextClass } from "@/lib/score-band";

// The audit project report, rendered inside the redesign chrome (F-R08 follow-up).
// It renders the crawler-computed `audit_results` blob (scores, recommendations,
// tech stack, design, missing pages, performance, standards) — the same data the
// classic report showed, restyled with the redesign tokens. Audit has no SEO
// scan, so there are no SEO tabs: this is a single scrollable report.

/* eslint-disable @typescript-eslint/no-explicit-any */
type AuditResults = Record<string, any>;

function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--rr-hairline)",
        borderRadius: 12,
        padding: 20,
        background: "var(--rr-surface-raised, transparent)",
      }}
    >
      {title && (
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--rr-text)", marginBottom: 14 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Chips({ items, tone = "muted" }: { items: string[]; tone?: "muted" | "accent" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((v, i) => (
        <span
          key={i}
          style={{
            fontSize: 12,
            padding: "3px 10px",
            borderRadius: 999,
            background:
              tone === "accent"
                ? "color-mix(in srgb, var(--rr-accent) 14%, transparent)"
                : "var(--rr-surface-raised)",
            border: "1px solid var(--rr-hairline)",
            color: tone === "accent" ? "var(--rr-accent)" : "var(--rr-text-2)",
          }}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

export function AuditReport({ results }: { results: AuditResults | null }) {
  if (!results || results.overall_score === null || results.overall_score === undefined) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "var(--rr-text-3)", fontSize: 13 }}>
        Audit results are being processed…
      </div>
    );
  }

  const overall: number = results.overall_score;
  const subScores: { title: string; score: number; description: string }[] = [
    { title: "Modernization", score: results.modernization_score ?? 0, description: "Technology stack" },
    { title: "Performance", score: results.performance_score ?? 0, description: "Load speed" },
    { title: "Completeness", score: results.completeness_score ?? 0, description: "Essential pages" },
    { title: "Standards", score: results.modern_standards?.score ?? 0, description: "Web standards" },
  ];

  const recs: any[] = Array.isArray(results.recommendations) ? results.recommendations : [];
  const tech = results.tech_stack ?? null;
  const design = results.design_analysis ?? null;
  const missing: string[] = Array.isArray(results.missing_pages) ? results.missing_pages : [];
  const perf = results.performance_metrics ?? null;
  const standardsFindings: string[] = Array.isArray(results.modern_standards?.findings)
    ? results.modern_standards.findings
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Overall score + sub-scores */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", flex: "none" }}>
            <div
              className={scoreTextClass(overall)}
              style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}
            >
              {overall}
            </div>
            <div style={{ fontSize: 12, color: "var(--rr-text-3)", marginTop: 4 }}>
              {scoreLabel(overall)} · overall
            </div>
          </div>
          <div
            style={{
              flex: "1 1 320px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 12,
            }}
          >
            {subScores.map((s) => (
              <div key={s.title} style={{ border: "1px solid var(--rr-hairline)", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12, color: "var(--rr-text-3)" }}>{s.title}</div>
                <div className={scoreTextClass(s.score)} style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>
                  {s.score}
                </div>
                <div style={{ fontSize: 11, color: "var(--rr-text-3)" }}>{s.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      {recs.length > 0 && (
        <Card title="Recommendations">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recs.map((rec, i) => {
              const tone =
                rec.type === "critical" ? "var(--rr-crit)" : rec.type === "important" ? "var(--rr-warn)" : "var(--rr-accent)";
              return (
                <div key={i} style={{ border: "1px solid var(--rr-hairline)", borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--rr-text)" }}>{rec.title}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, color: tone, border: `1px solid ${tone}` }}>
                      {rec.type}
                    </span>
                    {rec.effort && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, color: "var(--rr-text-3)", border: "1px solid var(--rr-hairline)" }}>
                        {rec.effort} effort
                      </span>
                    )}
                  </div>
                  {rec.description && (
                    <p style={{ fontSize: 13, color: "var(--rr-text-2)", margin: 0 }}>{rec.description}</p>
                  )}
                  {rec.impact && (
                    <p style={{ fontSize: 12, color: "var(--rr-text-3)", marginTop: 6, fontStyle: "italic" }}>
                      Impact: {rec.impact}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tech stack */}
      {tech && (
        <Card title="Technology stack">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {tech.framework && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--rr-text-3)" }}>Framework</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rr-text)" }}>{tech.framework}</div>
                </div>
              )}
              {tech.cms && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--rr-text-3)" }}>CMS</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rr-text)" }}>{tech.cms}</div>
                </div>
              )}
            </div>
            {Array.isArray(tech.libraries) && tech.libraries.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--rr-text-3)", marginBottom: 6 }}>Libraries</div>
                <Chips items={tech.libraries} tone="accent" />
              </div>
            )}
            {Array.isArray(tech.analytics) && tech.analytics.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--rr-text-3)", marginBottom: 6 }}>Analytics</div>
                <Chips items={tech.analytics} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Design */}
      {design && (Array.isArray(design.fonts) || Array.isArray(design.socialPlatforms)) && (
        <Card title="Design analysis">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.isArray(design.fonts) && design.fonts.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--rr-text-3)", marginBottom: 6 }}>Fonts detected</div>
                <Chips items={design.fonts.slice(0, 5)} />
              </div>
            )}
            {Array.isArray(design.socialPlatforms) && design.socialPlatforms.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--rr-text-3)", marginBottom: 6 }}>Social presence</div>
                <Chips items={design.socialPlatforms} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Missing pages */}
      {missing.length > 0 && (
        <Card title="Missing essential pages">
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--rr-crit)", fontSize: 13 }}>
            {missing.map((p, i) => (
              <li key={i} style={{ textTransform: "capitalize", marginBottom: 2 }}>{p}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Performance metrics */}
      {perf && (
        <Card title="Performance metrics">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {perf.avgLoadTime !== undefined && (
              <Metric label="Average load time" value={`${(perf.avgLoadTime / 1000).toFixed(2)} s`} />
            )}
            {perf.avgFirstByteTime !== undefined && (
              <Metric label="Time to first byte" value={`${Number(perf.avgFirstByteTime).toFixed(0)} ms`} />
            )}
            {perf.avgPageSize !== undefined && (
              <Metric label="Average page size" value={`${(perf.avgPageSize / 1024 / 1024).toFixed(2)} MB`} />
            )}
          </div>
          {Array.isArray(perf.slowestPages) && perf.slowestPages.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "var(--rr-text-3)", marginBottom: 6 }}>Slowest pages</div>
              {perf.slowestPages.slice(0, 5).map((pg: any, i: number) => (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, padding: "4px 0" }}
                >
                  <span className="rr-mono" style={{ color: "var(--rr-text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pg.url}
                  </span>
                  <span style={{ color: "var(--rr-text-2)", flex: "none" }}>{(pg.loadTime / 1000).toFixed(2)} s</span>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(perf.findings) && perf.findings.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "var(--rr-text-3)", marginBottom: 6 }}>Performance findings</div>
              <Findings findings={perf.findings} />
            </div>
          )}
        </Card>
      )}

      {/* Standards & accessibility */}
      {standardsFindings.length > 0 && (
        <Card title="Standards & accessibility">
          <Findings findings={standardsFindings} />
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid var(--rr-hairline)", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 12, color: "var(--rr-text-3)" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--rr-text)", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Findings({ findings }: { findings: string[] }) {
  const negative = /^no |^missing |not |lack|insufficient|without|outdated|slow|large |critical|invisible/i;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {findings.map((f, i) => {
        const bad = negative.test(f);
        return (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
            <span style={{ color: bad ? "var(--rr-crit)" : "var(--rr-pos)", flex: "none" }}>{bad ? "✗" : "✓"}</span>
            <span style={{ color: "var(--rr-text-2)" }}>{f}</span>
          </div>
        );
      })}
    </div>
  );
}
