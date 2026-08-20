-- Issue identity + history (Phase 2A). Turns issues from a per-scan snapshot
-- (pruned every scan) into persistent records reconciled across scans, so we
-- can report what changed, how long an issue has persisted, and let users
-- dismiss known-acceptable issues.
--
--   fingerprint   stable identity: hash of (page_id + issue_type + discriminator).
--                 Unique per project so a re-detected issue updates in place.
--   dismissed     user marked "won't fix / by design" — excluded from counts,
--                 preserved across scans (never re-opened by re-detection).
--   dismissed_at  when it was dismissed.
--   seen_count    how many scans have detected this issue (for "N crawls" age).
--
-- Reused existing columns: created_at = first-seen, updated_at = last-seen,
-- is_fixed/fixed_at = auto-resolved (issue no longer detected on a crawled page).

ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS fingerprint text,
  ADD COLUMN IF NOT EXISTS dismissed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dismissed_at timestamptz,
  ADD COLUMN IF NOT EXISTS seen_count integer NOT NULL DEFAULT 1;

-- Upsert arbiter for reconciliation. NULLs are distinct, so the pre-migration
-- rows (fingerprint IS NULL) don't collide; the crawler clears them once on the
-- first reconcile to establish a clean baseline.
CREATE UNIQUE INDEX IF NOT EXISTS issues_project_fingerprint_uidx
  ON public.issues (project_id, fingerprint);
