-- Per-page internal link counts (inlinks/outlinks) for the link-graph export & UI.
-- Populated by the crawler after page_links are inserted, via update_page_link_counts().
--
-- Definitions (decided 2026-08-19):
--   inlink_count         = total inbound internal link instances (followed + nofollow)
--   unique_inlink_count  = distinct source pages linking in
--   outlink_count        = total outbound internal link instances
--   unique_outlink_count = distinct destination pages linked to
-- "Internal" = the link resolved to a crawled page (destination_page_id IS NOT NULL).

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS inlink_count integer,
  ADD COLUMN IF NOT EXISTS unique_inlink_count integer,
  ADD COLUMN IF NOT EXISTS outlink_count integer,
  ADD COLUMN IF NOT EXISTS unique_outlink_count integer;

-- Recompute all four counts for every page in a project in a single statement.
-- Done in-database (not row-by-row in the app) so it is not subject to the
-- PostgREST 1000-row read cap and stays a single round-trip.
CREATE OR REPLACE FUNCTION public.update_page_link_counts(p_project_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  WITH inbound AS (
    SELECT destination_page_id AS pid,
           count(*)::int AS total,
           count(DISTINCT source_page_id)::int AS uniq
    FROM public.page_links
    WHERE project_id = p_project_id
      AND destination_page_id IS NOT NULL
    GROUP BY destination_page_id
  ),
  outbound AS (
    SELECT source_page_id AS pid,
           count(*)::int AS total,
           count(DISTINCT destination_page_id)::int AS uniq
    FROM public.page_links
    WHERE project_id = p_project_id
      AND destination_page_id IS NOT NULL
    GROUP BY source_page_id
  )
  UPDATE public.pages p
  SET inlink_count         = coalesce(i.total, 0),
      unique_inlink_count  = coalesce(i.uniq, 0),
      outlink_count        = coalesce(o.total, 0),
      unique_outlink_count = coalesce(o.uniq, 0)
  FROM (SELECT id FROM public.pages WHERE project_id = p_project_id) ids
  LEFT JOIN inbound i  ON i.pid = ids.id
  LEFT JOIN outbound o ON o.pid = ids.id
  WHERE p.id = ids.id;
$$;
