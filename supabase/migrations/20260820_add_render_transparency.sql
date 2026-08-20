-- Render / JS-execution transparency: record per page how RankRiot saw it.
-- These are computed on every scan (ScanResult) but were previously discarded.
--
--   scan_method       'http' | 'headless' — did we execute JavaScript
--   detected_platform  e.g. 'shopify' | 'nextjs' | 'plasmic' | null
--   js_rendering_gap   { http_word_count, headless_word_count, delta_percent }
--                      how much content JS added (only set on a meaningful gap)
--   schema_source     'server' | 'client' | 'both' | 'none'
--                      is JSON-LD in the raw server HTML ('server'/'both') or
--                      only injected after render ('client') — the difference
--                      between Google seeing the schema and not.

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS scan_method text,
  ADD COLUMN IF NOT EXISTS detected_platform text,
  ADD COLUMN IF NOT EXISTS js_rendering_gap jsonb,
  ADD COLUMN IF NOT EXISTS schema_source text;
