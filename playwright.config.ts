import { defineConfig, devices } from "@playwright/test";

// End-to-end tests (Playwright + axe). NOT part of the default `pnpm test`
// (which is vitest, src-only). Run with `pnpm test:e2e` against a running app.
//
// Setup (needs network + a running app + a Supabase DB — like the crawler's
// fetch-layer integration tests, this does not run in the restricted dev
// sandbox):
//   pnpm add -D @playwright/test @axe-core/playwright
//   npx playwright install chromium
//   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3123 pnpm test:e2e
//
// Authenticated specs (scan trigger, pages list/detail) are skipped unless
// E2E_STORAGE_STATE points at a saved logged-in session (see e2e/README.md).

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3123";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  // Reuse an already-running dev server if present; otherwise boot one. The dev
  // server needs the app's env (Supabase, crawler URL) to be set.
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
