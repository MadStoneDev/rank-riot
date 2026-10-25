import type { SupabaseClient } from "@supabase/supabase-js";

// Server-side, PAGINATED reader for a project's crawled `pages` (F-P01). A plain
// `.select(...)` is silently capped at PostgREST's default row ceiling (1000),
// so any report/tool page that read "all pages" that way showed incomplete and
// therefore wrong metrics on large projects. Reading in ordered chunks returns
// the complete set; a column projection keeps memory bounded, so callers pass
// only the columns they use.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = SupabaseClient<any, any, any>;

const CHUNK = 1000;

/**
 * Soft ceiling for lists that are shipped whole to the browser (the page list,
 * image audit, schema audit). Up to this many pages are loaded — comfortably
 * above every real project — beyond which the view shows a bounded slice and
 * the (server-side) export is the complete source. Keeps a pathological project
 * from OOM-ing the client without the silent 1000-row truncation it replaces.
 */
export const PAGE_LIST_CEILING = 20000;

export interface FetchPagesOpts {
  /** Extra PostgREST filters applied to every chunk query. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?: (q: any) => any;
  /** Column to order by — stable ordering keeps chunk boundaries consistent. */
  orderBy?: string;
  ascending?: boolean;
  /** Hard ceiling on rows returned (e.g. PAGE_LIST_CEILING for client lists). */
  max?: number;
}

/**
 * Fetch crawled page rows for a project, one chunk at a time, excluding
 * non-HTTP URLs (mailto:, tel:, …) as every caller did. Returns the complete
 * set unless `max` is given.
 */
export async function fetchAllProjectPages<T = Record<string, unknown>>(
  supabase: DB,
  projectId: string,
  columns: string,
  opts: FetchPagesOpts = {},
): Promise<T[]> {
  const { filter, orderBy = "id", ascending = true, max } = opts;
  const out: T[] = [];
  for (let from = 0; ; from += CHUNK) {
    let q = supabase
      .from("pages")
      .select(columns)
      .eq("project_id", projectId)
      .like("url", "http%")
      .order(orderBy, { ascending })
      .range(from, from + CHUNK - 1);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    out.push(...(data as unknown as T[]));
    if (max && out.length >= max) return out.slice(0, max);
    if (data.length < CHUNK) break;
  }
  return out;
}
