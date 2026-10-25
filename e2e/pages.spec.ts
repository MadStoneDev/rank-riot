import { test, expect } from "@playwright/test";

// Authenticated flow: the pages list and the page-detail slide-over. Needs a
// logged-in session AND at least one scanned project. Set E2E_STORAGE_STATE and
// E2E_PROJECT_ID (a project with a completed scan) to run.
const storageState = process.env.E2E_STORAGE_STATE;
const projectId = process.env.E2E_PROJECT_ID;

test.describe("pages list + detail", () => {
  test.skip(
    !storageState || !projectId,
    "set E2E_STORAGE_STATE and E2E_PROJECT_ID",
  );
  test.use({ storageState });

  test("lists pages with scores and opens a page's detail", async ({ page }) => {
    await page.goto(`/projects/${projectId}/pages-redesign`);
    // The header reports a page count.
    await expect(page.getByText(/\d+ pages/)).toBeVisible();
    // Each row shows a score or an em dash (persisted score, SC-02) — never a
    // recomputed number. Open the first page row.
    const firstRow = page.locator("a[href*='/pages-redesign/']").first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();
    // Detail (full page or slide-over) shows the page title + sections.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
