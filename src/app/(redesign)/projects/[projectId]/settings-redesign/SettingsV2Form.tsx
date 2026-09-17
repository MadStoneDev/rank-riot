"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { updateProject, deleteProject } from "@/app/(private)/projects/actions";

// Screen 5 — project settings, restyled to the exception-based system. Same IA
// as the classic form (general / key pages / excluded paths / danger), writing
// through the existing updateProject / deleteProject actions and the
// projects.settings JSONB shape.

const KEY_PAGES = ["contact", "about", "blog", "services"] as const;
type KeyPage = (typeof KEY_PAGES)[number];

const FREQUENCIES = [
  { value: "manual", label: "Manual only" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DOMAIN_FORMATS = [
  { value: "", label: "Auto-detect" },
  { value: "www", label: "www" },
  { value: "non-www", label: "Non-www" },
];

interface SettingsShape {
  version?: number;
  crawl?: {
    sitemap_path?: string;
    exclude_patterns?: string[];
    www_preference?: "www" | "non-www";
    force_headless?: boolean;
  };
  pages?: Partial<Record<KeyPage | "pricing", string>>;
  custom_urls?: unknown[];
}

export function SettingsV2Form({
  projectId,
  initialName,
  initialUrl,
  initialFrequency,
  initialSettings,
}: {
  projectId: string;
  initialName: string;
  initialUrl: string;
  initialFrequency: string;
  initialSettings: SettingsShape | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState(initialUrl);
  const [frequency, setFrequency] = useState(initialFrequency || "manual");
  const [wwwPref, setWwwPref] = useState<string>(
    initialSettings?.crawl?.www_preference ?? "",
  );
  const [keyPages, setKeyPages] = useState<Record<KeyPage, string>>(() => ({
    contact: initialSettings?.pages?.contact ?? "",
    about: initialSettings?.pages?.about ?? "",
    blog: initialSettings?.pages?.blog ?? "",
    services: initialSettings?.pages?.services ?? "",
  }));
  const [excluded, setExcluded] = useState<string[]>(
    initialSettings?.crawl?.exclude_patterns ?? [],
  );
  const [newPath, setNewPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const snapshot = useMemo(
    () => JSON.stringify({ name, url, frequency, wwwPref, keyPages, excluded }),
    [name, url, frequency, wwwPref, keyPages, excluded],
  );
  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: initialName,
        url: initialUrl,
        frequency: initialFrequency || "manual",
        wwwPref: initialSettings?.crawl?.www_preference ?? "",
        keyPages: {
          contact: initialSettings?.pages?.contact ?? "",
          about: initialSettings?.pages?.about ?? "",
          blog: initialSettings?.pages?.blog ?? "",
          services: initialSettings?.pages?.services ?? "",
        },
        excluded: initialSettings?.crawl?.exclude_patterns ?? [],
      }),
    [initialName, initialUrl, initialFrequency, initialSettings],
  );
  const isDirty = snapshot !== initialSnapshot;

  const addPath = () => {
    const p = newPath.trim();
    if (!p) return;
    if (!excluded.includes(p)) setExcluded((prev) => [...prev, p]);
    setNewPath("");
  };

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      const pages: Record<string, string> = {};
      for (const k of KEY_PAGES) if (keyPages[k].trim()) pages[k] = keyPages[k].trim();

      const settings: SettingsShape = {
        ...(initialSettings ?? {}),
        version: 1,
        crawl: {
          ...(initialSettings?.crawl ?? {}),
          exclude_patterns: excluded,
          ...(wwwPref ? { www_preference: wwwPref as "www" | "non-www" } : {}),
        },
        pages,
      };
      if (!wwwPref && settings.crawl) delete settings.crawl.www_preference;

      const fd = new FormData();
      fd.set("id", projectId);
      fd.set("name", name);
      fd.set("url", url);
      fd.set("scan_frequency", frequency);
      fd.set("settings", JSON.stringify(settings));

      const res = await updateProject(fd);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Settings saved");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!confirm("Delete this project? Crawled data is retained for backlink analysis.")) return;
    setDeleting(true);
    try {
      const res = await deleteProject(projectId);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        setDeleting(false);
      } else {
        router.push("/overview");
      }
    } catch {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "0 32px",
          height: 64,
          borderBottom: "1px solid var(--rr-hairline)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Project settings</h1>
          <span className="rr-mono" style={{ fontSize: 12, color: "var(--rr-text-3)" }}>
            {initialName}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          style={{
            height: 34,
            padding: "0 16px",
            borderRadius: 7,
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: isDirty && !saving ? "pointer" : "default",
            background: "var(--rr-accent)",
            color: "var(--rr-accent-ink)",
            opacity: isDirty && !saving ? 1 : 0.45,
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div style={{ maxWidth: 760, padding: "8px 32px 96px" }}>
        {/* General */}
        <Section title="General">
          <Field label="Project name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Website URL">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rr-mono"
              style={inputStyle}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Scan frequency">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={inputStyle}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Domain format">
              <select
                value={wwwPref}
                onChange={(e) => setWwwPref(e.target.value)}
                style={inputStyle}
              >
                {DOMAIN_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* Key pages */}
        <Section title="Key pages">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {KEY_PAGES.map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 70,
                    fontSize: 13,
                    color: "var(--rr-text-2)",
                    textTransform: "capitalize",
                    flex: "none",
                  }}
                >
                  {k}
                </span>
                <input
                  value={keyPages[k]}
                  onChange={(e) =>
                    setKeyPages((prev) => ({ ...prev, [k]: e.target.value }))
                  }
                  placeholder={`/${k}`}
                  className="rr-mono"
                  style={{ ...inputStyle, height: 32 }}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Excluded paths */}
        <Section title="Excluded paths">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {excluded.map((p) => (
              <span
                key={p}
                className="rr-mono"
                style={{
                  height: 28,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 8px 0 10px",
                  borderRadius: 6,
                  border: "1px solid var(--rr-border)",
                  fontSize: 12,
                }}
              >
                {p}
                <button
                  onClick={() => setExcluded((prev) => prev.filter((x) => x !== p))}
                  aria-label={`Remove ${p}`}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--rr-text-3)",
                    display: "flex",
                  }}
                >
                  <X size={13} strokeWidth={1.5} />
                </button>
              </span>
            ))}
            <input
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPath();
                }
              }}
              placeholder="Add path (e.g. /cart)"
              className="rr-mono"
              style={{ ...inputStyle, height: 28, width: 180, flex: "none" }}
            />
          </div>
          <p style={{ marginTop: 10, fontSize: 13, color: "var(--rr-text-3)" }}>
            Paths matching these patterns are skipped during the crawl.
          </p>
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rr-crit)" }}>
                Delete project
              </div>
              <div style={{ fontSize: 13, color: "var(--rr-text-3)", marginTop: 2 }}>
                Crawled data is retained for backlink analysis.
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                height: 32,
                padding: "0 14px",
                borderRadius: 6,
                background: "none",
                border: "1px solid color-mix(in srgb, var(--rr-crit) 45%, transparent)",
                color: "var(--rr-crit)",
                fontSize: 13,
                fontWeight: 600,
                cursor: deleting ? "default" : "pointer",
                flex: "none",
              }}
            >
              {deleting ? "Deleting…" : "Delete project"}
            </button>
          </div>
        </Section>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 12px",
  borderRadius: 7,
  border: "1px solid var(--rr-border)",
  background: "var(--rr-surface)",
  color: "var(--rr-text)",
  fontSize: 14,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        paddingTop: 22,
        marginTop: 22,
        borderTop: "1px solid var(--rr-hairline)",
      }}
    >
      <div
        className="rr-mono"
        style={{
          fontSize: 11,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--rr-text-3)",
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--rr-text-2)" }}>{label}</span>
      {children}
    </label>
  );
}
