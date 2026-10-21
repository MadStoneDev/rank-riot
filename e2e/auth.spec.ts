import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Unauthenticated auth-page flow. Runs without a session, so it's always live.
test.describe("auth page", () => {
  test("shows the email sign-in form and advances to the OTP step", async ({
    page,
  }) => {
    await page.goto("/auth");
    const email = page.getByLabel(/email/i);
    await expect(email).toBeVisible();
    await email.fill("e2e@example.com");
    await page.getByRole("button", { name: /continue with email/i }).click();
    // Step 2 asks for the verification code.
    await expect(page.getByText(/verification code/i)).toBeVisible();
  });

  test("surfaces an invalid email-link error from the query param (F-A01/F-R02)", async ({
    page,
  }) => {
    await page.goto("/auth?error=email_link_invalid");
    await expect(
      page.getByText(/that email link is invalid or has expired/i),
    ).toBeVisible();
  });

  test("has no critical/serious accessibility violations (axe)", async ({
    page,
  }) => {
    await page.goto("/auth");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
