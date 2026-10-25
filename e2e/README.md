# End-to-end tests (Playwright + axe)

These are **not** part of `pnpm test` (that's vitest, `src/**` only). They need
network, a running app and a Supabase DB, so they run in CI/staging, not the
restricted dev sandbox.

## Install (one time)

```bash
pnpm add -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

(The devDependencies are intentionally not committed yet — adding them without
network access here would desync the lockfile. Run the command above in an
environment with network, then commit the lockfile change.)

## Run

```bash
# against a dev server (auto-started via playwright.config webServer)
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3123 pnpm test:e2e

# or against an already-running / deployed URL
PLAYWRIGHT_BASE_URL=https://staging.rankriot.app pnpm test:e2e
```

## What runs without a login

- `auth.spec.ts` — the sign-in form, the OTP step, the `?error=` banner
  (F-A01/F-R02), and an axe accessibility scan of `/auth`.
- `mobile-nav.spec.ts` — no horizontal overflow on `/auth` at Pixel-5 width.

## Authenticated specs (need a saved session)

Sign-in is OTP / Google only (no password), so a session can't be created from
form fill alone. Create a storage state once (e.g. a global-setup that logs in a
seeded test user via a Supabase magic-link/OTP in a test project, then
`context.storageState({ path })`), and point the specs at it:

```bash
export E2E_STORAGE_STATE=./e2e/.auth/state.json
export E2E_PROJECT_ID=<a project id with a completed scan>
pnpm test:e2e
```

Without `E2E_STORAGE_STATE` the authenticated specs (`scan-trigger.spec.ts`,
`pages.spec.ts`, the BottomNav check in `mobile-nav.spec.ts`) skip themselves.
