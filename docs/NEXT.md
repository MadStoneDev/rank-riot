# NEXT — rank-riot (frontend)

Start-here for a fresh session. Read alongside `CLAUDE.md`. Last updated 2026-10-28.

## Current state

`main` is the live branch (Next.js 15, deploys from git via Coolify). Recent work
(all committed on `main`):

- **F-D12** (`7b394e9` + `86fa50d`, pushed): the frontend renders SEO issues from
  the persisted `issues` table, not client-side recomputes.
  - Deleted the dead client-side recompute subsystem (`utils/technical-health.ts`,
    `utils/content-intelligence.ts`, their types + card components). Kept
    `calculateLinkStats` for the sitemap link graph.
  - The **speed** report (`(redesign)/projects/[projectId]/speed/page.tsx`) now
    flags pages only from persisted `slow_page` / `large_page_size`; TTFB/load/size
    are plain sortable raw-data columns (`components/redesign/SpeedTable.tsx`);
    `slow_server_response` is a site-level banner; headless-timed pages show
    "Timing not comparable". Medians over HTTP pages only.
- **ESLint gate** (`fc20412`, pushed): `eslint.config.mjs` (ESLint 9 +
  eslint-config-next). `pnpm lint` works. `no-explicit-any` = warn;
  `react/no-unescaped-entities` = off. **The Paddle billing surface is excluded
  from lint** (`components/billing/**`, `lib/paddle.ts`, `SubscriptionProvider.tsx`,
  `dashboard/billing/**`) per the billing freeze — re-include after the Stripe
  migration.
- **API keys** (`70e0929`): "API keys" section under account settings
  (`dashboard/settings`), gated by `profiles.api_access` (or admin). Create (label
  + scopes; raw key shown once), list (prefix/scopes/usage/quota), revoke with
  confirm. It calls the crawler's `/api/keys` with the user's access token
  (`lib/api-keys-client.ts`) — no key crypto in the frontend. Admin controls on the
  admin user detail page (`ApiAccessManager` toggle, `UserApiKeys` for per-key
  rate/quota + revoke) via new `/api/admin` actions.
- **Audit in the redesign** (`a434769`): audit projects render inside the redesign
  chrome. `/projects/[id]` moved from the `(private)` dispatcher into
  `(redesign)/projects/[projectId]/page.tsx` (SEO → `/fixes`; audit → the report
  via `components/redesign/AuditReport.tsx`). Sidebar is project-type aware. The
  F-R08 redirect-to-classic guard is gone and the classic audit UI
  (`AuditProjectDetailPage`, `AuditResults`, `ScanProgress`) is deleted.

## Deployed vs not

- Pushed to GitHub `main`: F-D12 and the ESLint commit (likely already deployed by
  Coolify).
- **NOT deployed until the next Coolify deploy:** API-key screen (`70e0929`) and
  the audit-redesign (`a434769`).
- The API-key screen only works once the **crawler** is deployed with its
  `/api/keys` endpoints AND the `profiles.api_access` migration is applied (see the
  crawler's `docs/NEXT.md`). Until then the section is hidden (no `api_access`) and
  create calls fail closed.

## What you must do

1. **Apply the crawler migration** `2026-10-28_0001_profiles_api_access.sql` (adds
   `profiles.api_access`) — see `crawl-rank-riot/docs/NEXT.md` for the full ordered
   list. The frontend reads `api_access` defensively (cast), so no frontend
   migration, but regenerate types with supatypes so it's in `database.types.ts`.
2. **Grant API access**: it's an admin action (default off). On a user's admin
   detail page, toggle "API access" on. Billing will drive this later.
3. **Deploy** the frontend (and the crawler) via Coolify.
4. No new env vars. `CRAWLER_API_URL` (server-side) is already set and is reused by
   the API-key screen. `NEXT_PUBLIC_BASE_URL` must remain set at build time
   (see memory `frontend_env_base_url`).

## Backlog (priority order)

1. **Billing (Paddle → Stripe)** — waiting on your decisions; billing code is
   frozen and excluded from lint. When decided: wire it, re-include the billing
   files in `eslint.config.mjs`, and let the plan drive `api_access` / API tiers.
2. **Database backups** — no automated backup of the self-hosted Supabase. Decide
   cadence/retention/offsite and wire it (shared concern with the crawler repo).
3. **Deferred / smaller:**
   - Audit projects can still reach SEO section URLs directly (e.g. `/fixes`) and
     see empty data — the F-R08 guard was intentionally dropped. Add a per-page
     audit→`/projects/[id]` redirect if that edge case matters.
   - `no-explicit-any` = warn and `react/no-unescaped-entities` = off; tighten per
     area over time. Re-include the billing files in lint post-Stripe.
   - Roadmap (see memory `master_plan` / `next_work_backlog`): GSC integration,
     history compare polish, image-audit depth, Web Bot Auth UI.
