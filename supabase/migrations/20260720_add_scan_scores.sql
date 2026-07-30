-- Phase 1: canonical per-scan score storage.
--
-- One row per scan holding the full structured ScoreReport (JSONB) plus flat
-- columns for the overall + category scores, so trend/history queries never
-- have to parse JSON. Written by the crawler (service role) at scan completion;
-- read by the frontend. This is the single source of truth every surface reads,
-- replacing the several divergent scoring paths. See RANKRIOT_MASTER_PLAN.md
-- Phase 1.
--
-- Safe to run more than once (guards throughout). Applies no data changes on
-- its own; scores populate as scans run under the new crawler, plus the Phase 1
-- backfill script.

CREATE TABLE IF NOT EXISTS scan_scores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- One score row per scan. UNIQUE lets the backfill / a re-score UPSERT.
  scan_id      UUID NOT NULL UNIQUE REFERENCES scans(id)    ON DELETE CASCADE,
  -- Denormalized so trend queries filter by project without joining scans.
  project_id   UUID NOT NULL        REFERENCES projects(id) ON DELETE CASCADE,

  -- Formula version. Bump when the scoring math changes; lets us tell which
  -- scans were scored under which model and re-backfill selectively.
  version      INTEGER  NOT NULL,

  -- Flat 0-100 scores for fast trend queries. `overall` is always present;
  -- category columns are nullable because SEO and audit scans populate
  -- different category sets (e.g. geo is SEO-only).
  overall      SMALLINT NOT NULL CHECK (overall   BETWEEN 0 AND 100),
  technical    SMALLINT          CHECK (technical BETWEEN 0 AND 100),
  content      SMALLINT          CHECK (content   BETWEEN 0 AND 100),
  media        SMALLINT          CHECK (media     BETWEEN 0 AND 100),
  aeo          SMALLINT          CHECK (aeo       BETWEEN 0 AND 100),
  geo          SMALLINT          CHECK (geo       BETWEEN 0 AND 100),

  -- True when the crawl was bot-blocked; overall + categories are forced to 0
  -- so a refused crawl can never present a flattering score.
  blocked      BOOLEAN  NOT NULL DEFAULT FALSE,

  -- The full ScoreReport: per-category check results (with the offending URLs)
  -- and per-page scores. This is what powers the "show me the exact problem"
  -- drill-down in the UI.
  report       JSONB    NOT NULL,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trend/history: latest scores per project over time.
CREATE INDEX IF NOT EXISTS idx_scan_scores_project_created
  ON scan_scores (project_id, created_at DESC);

-- (scan_id already has a unique index from the UNIQUE constraint above.)


-- ─────────────────────────────────────────────────────────────────────────
--  ROW-LEVEL SECURITY
--
--  Enabled by default because Supabase grants the `authenticated` role SELECT
--  on new public tables; WITHOUT a policy that would let any signed-in user
--  read every project's scores. The crawler writes with the service-role key,
--  which bypasses RLS, so writes are unaffected.
--
--  ▸ ACTION FOR RICHARD: confirm this matches how your other data tables
--    (scans, pages, scan_snapshots) are secured. If they use a different
--    ownership pattern (a helper function, a membership table, etc.), swap the
--    USING clause below to match. If they run WITHOUT RLS behind a restricted
--    grant setup, you can drop this block — but verify the leak note above.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE scan_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own project scan scores" ON scan_scores;
CREATE POLICY "read own project scan scores"
  ON scan_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = scan_scores.project_id
        AND p.user_id = auth.uid()
    )
  );
