import "@/components/redesign/tokens.css";
import { plexSans, plexMono } from "@/lib/redesign-fonts";
import {
  SeverityDot,
  Flag,
  MetricCard,
  MetricStrip,
  Row,
  PrimaryButton,
} from "@/components/redesign/primitives";
import { TabBar } from "@/components/redesign/TabBar";

// Preview of the exception-based redesign's design-system foundation. Additive
// and scoped (`.rr`) so it does not touch the current app. Real screens compose
// from these primitives; this route just lets us eyeball them on live fonts.
export default function DesignPreviewPage() {
  return (
    <div
      className={`rr ${plexSans.variable} ${plexMono.variable}`}
      style={{ minHeight: "100vh" }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "48px 32px 96px",
          display: "flex",
          flexDirection: "column",
          gap: 44,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            className="rr-mono"
            style={{
              fontSize: 11,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--rr-text-3)",
            }}
          >
            RankRiot · exception-based redesign · foundation
          </div>
          <div style={{ fontSize: 19, fontWeight: 600 }}>
            Design-system primitives
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--rr-text-2)",
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            Nothing renders unless it is wrong. One indigo accent for the single
            primary action. Red and amber are severity ink and nothing else.
          </div>
        </div>

        {/* Metric strip */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SectionLabel>Metric cards — the only bordered container</SectionLabel>
          <MetricStrip>
            <MetricCard label="Pages" value="482" />
            <MetricCard label="Fixes" value="9" delta="−3" deltaTone="positive" />
            <MetricCard label="Critical" value="2" delta="+1" deltaTone="critical" />
            <MetricCard label="Median TTFB" value="1.9s" />
          </MetricStrip>
        </section>

        {/* Tabs */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SectionLabel>Tab bar</SectionLabel>
          <TabBar tabs={["Fixes", "Pages", "Links", "Schema", "Settings"]} />
        </section>

        {/* Exception list — Pages tab, filtered to exceptions */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SectionLabel>
            Rows + flags — Pages tab, exceptions only (healthy pages show
            nothing)
          </SectionLabel>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Row
              primary={
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                >
                  <SeverityDot severity="critical" /> Contact
                </span>
              }
              secondary="/contact"
              flags={<Flag severity="critical">No title</Flag>}
              metrics={<span>410 KB</span>}
            />
            <Row
              primary={
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                >
                  <SeverityDot severity="warning" /> Newsletter
                </span>
              }
              secondary="/newsletter"
              flags={
                <>
                  <Flag severity="warning">Orphan</Flag>
                  <Flag severity="low">Thin</Flag>
                </>
              }
              metrics={<span>0 inlinks</span>}
            />
            <Row
              primary={
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                >
                  <SeverityDot severity="warning" /> Money First CEO Podcast
                </span>
              }
              secondary="/podcast/ep-12"
              flags={<Flag severity="low">FAQ without schema</Flag>}
              metrics={<span>511 words</span>}
            />
          </div>
        </section>

        {/* Primary action */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SectionLabel>Primary action</SectionLabel>
          <div>
            <PrimaryButton>Scan</PrimaryButton>
          </div>
        </section>

        {/* Token legend */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SectionLabel>Colour tokens</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 10,
            }}
          >
            <Swatch name="bg" hex="#0C0D10" />
            <Swatch name="surface" hex="#101216" />
            <Swatch name="hairline" hex="#17191E" />
            <Swatch name="text-primary" hex="#EDEEF0" />
            <Swatch name="text-secondary" hex="#8B9099" />
            <Swatch name="text-muted" hex="#5F656E" />
            <Swatch name="accent" hex="#5C7CFF" />
            <Swatch name="severity-critical" hex="#F0575D" />
            <Swatch name="severity-warning" hex="#E0A340" />
            <Swatch name="positive-delta" hex="#4FA383" />
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rr-mono"
      style={{
        fontSize: 11,
        letterSpacing: ".09em",
        textTransform: "uppercase",
        color: "var(--rr-text-3)",
      }}
    >
      {children}
    </div>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: hex,
          border: "1px solid var(--rr-border)",
        }}
      />
      <div style={{ flex: 1, fontSize: 13 }}>{name}</div>
      <div
        className="rr-mono"
        style={{ fontSize: 12, color: "var(--rr-text-3)" }}
      >
        {hex}
      </div>
    </div>
  );
}
