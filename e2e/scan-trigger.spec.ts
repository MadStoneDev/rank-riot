import { test, expect } from "@playwright/test";

// Authenticated flow: starting a scan from the /overview scan box. Needs a
// logged-in session (OTP/Google only — see e2e/README.md) and so is skipped
// unless E2E_STORAGE_STATE points at a saved session.
const storageState = process.env.E2E_STORAGE_STATE;

test.describe("scan trigger", () => {
  test.skip(!storageState, "set E2E_STORAGE_STATE to a logged-in session");
  test.use({ storageState });

  test("quick-scan a URL creates a project and lands on its report", async ({
    page,
  }) => {
    await page.goto("/overview");
    await page.getByPlaceholder(/enter a url to scan/i).fill("example.com");
    await page.getByRole("button", { name: /^scan$/i }).click();
    // Success → the SEO report; failure would send us back with ?error=scan.
    await expect(page).toHaveURL(/\/projects\/[^/]+\/fixes/);
  });

  test("surfaces a scan-start failure on /overview (F-S03)", async ({ page }) => {
    // The banner is driven by ?error=; assert it renders the plain message.
    await page.goto("/overview?error=scan");
    await expect(
      page.getByRole("alert").filter({ hasText: /scan could not be started/i }),
    ).toBeVisible();
  });
});
