import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SearchBox } from "./SearchBox";

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)
    .is("deleted_at", null);
  const list = projects ?? [];
  const ids = list.map((p) => p.id);
  const nameById = new Map(list.map((p) => [p.id, p.name]));

  // Strip characters that would break the PostgREST .or() filter grammar.
  const safe = q.replace(/[,()%]/g, " ").trim();

  let results: { id: string; url: string; title: string | null; project_id: string }[] = [];
  if (safe.length >= 2 && ids.length > 0) {
    const { data } = await supabase
      .from("pages")
      .select("id, url, title, project_id")
      .in("project_id", ids)
      .like("url", "http%")
      .or(`url.ilike.%${safe}%,title.ilike.%${safe}%`)
      .limit(50);
    results = data ?? [];
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ padding: "20px 32px 16px", borderBottom: "1px solid var(--rr-hairline)" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 14px" }}>Search</h1>
        <SearchBox initial={q} />
      </div>

      <div style={{ padding: "8px 32px 96px" }}>
        {q.length < 2 ? (
          <div style={{ padding: "48px 0", color: "var(--rr-text-3)", fontSize: 13 }}>
            Type at least two characters to search your crawled pages.
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: "48px 0", color: "var(--rr-text-2)", fontSize: 13 }}>
            No pages match &ldquo;{q}&rdquo;.
          </div>
        ) : (
          <>
            <div
              className="rr-mono"
              style={{ fontSize: 12, color: "var(--rr-text-3)", padding: "12px 12px 8px" }}
            >
              {results.length}
              {results.length === 50 ? "+" : ""} {results.length === 1 ? "result" : "results"}
            </div>
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/projects/${r.project_id}/pages-redesign/${r.id}`}
                style={{
                  display: "block",
                  padding: "12px",
                  borderBottom: "1px solid var(--rr-hairline)",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>
                  {r.title || "Untitled page"}
                </div>
                <div
                  className="rr-mono"
                  style={{
                    fontSize: 12,
                    color: "var(--rr-text-3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {nameById.get(r.project_id)} · {pathOf(r.url)}
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
