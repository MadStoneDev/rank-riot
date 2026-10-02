-- P0.5 / P0.6: record WHY a scan failed and WHICH crawler/check version
-- produced it, so the app can (a) show a real failed state instead of a
-- flattering "everything's clean" for a 0-page crawl, and (b) flag results from
-- a superseded crawler version and offer a rescan.
--
-- `status` already exists and already carries 'failed'; these are additive,
-- nullable columns. Safe to run on a live DB (no backfill, no rewrite).

alter table public.scans
  add column if not exists failure_reason text,
  add column if not exists crawler_version text,
  add column if not exists check_version text;

comment on column public.scans.failure_reason is
  'Human-readable reason a scan ended with status = failed (e.g. 0 pages crawled, bot-blocked, off-host redirect).';
comment on column public.scans.crawler_version is
  'Crawler release that produced this scan (YYYY.MM.DD). NULL = pre-versioning; such scans predate the Oct 2026 parsing fixes.';
comment on column public.scans.check_version is
  'Issue-detection ruleset version that produced this scan''s findings (YYYY.MM.DD).';

-- Helps the overview/history quickly find the latest successful scan per project.
create index if not exists scans_project_status_idx
  on public.scans (project_id, status, completed_at desc);
