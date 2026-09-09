-- Page-type segmentation (Phase A2). The crawler classifies every URL by role
-- (content / tag / category / author / pagination / date_archive / search /
-- feed / attachment / utility) from its URL pattern. WordPress and most CMSes
-- expose predictable taxonomy/pagination URLs; treating a tag archive or a
-- /page/2 listing as an ordinary content page inflated thin-content,
-- missing-H1/meta, duplicate-title and orphan counts many times over.
--
-- Phase A1 already excludes non-content pages from those issue counts (that
-- logic is URL-derived and needs no column). This column persists the type so
-- the app can show archive/taxonomy pages as their own segment, score site
-- health per segment, and export the classification.
--
--   page_type  the classified role; NULL on pages crawled before this shipped,
--              populated on the next scan (or by a backfill).

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS page_type text;

-- Segment filtering / per-type counts scan by (project_id, page_type).
CREATE INDEX IF NOT EXISTS pages_project_page_type_idx
  ON public.pages (project_id, page_type);
