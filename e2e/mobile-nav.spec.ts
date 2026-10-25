import { test, expect } from "@playwright/test";

// Mobile navigation / layout. Run under the "mobile" project (Pixel 5). The
// unauthenticated check always runs; the BottomNav check needs a session.
const storageState = process.env.E2E_STORAGE_STATE;

test.describe("mobile", () => {
  test("the auth page has no horizontal overflow at phone width", async ({
    page,
  }) => {
    await page.goto("/auth");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow, "page scrolls horizontally on mobile").toBe(false);
  });

  test.describe("authenticated chrome", () => {
    test.skip(!storageState, "set E2E_STORAGE_STATE to a logged-in session");
    test.use({ storageState });

    test("shows the bottom nav and no horizontal overflow on /overview", async ({
      page,
    }) => {
      await page.goto("/overview");
      await expect(page.getByRole("navigation")).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, "overview scrolls horizontally on mobile").toBe(false);
    });
  });
});
