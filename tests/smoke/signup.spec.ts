import { test, expect } from '@playwright/test';

// Smoke: Signup/onboarding happy path
test('signup and start first study session', async ({ page }) => {
  // Adjust base URL in playwright.config.ts if needed
  await page.goto('/');

  // Open signup / onboarding flow
  await page.click('text=Sign up');
  await page.fill('input[name="email"]', 'qa+smoke@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button:has-text("Create account")');

  // Expect to land on onboarding / first session page
  await expect(page.locator('text=Welcome')).toBeVisible();
  await expect(page.locator('text=Start your first session')).toBeVisible();

  // Start a quick study session and assert happy path
  await page.click('text=Start session');
  await expect(page.locator('text=Session in progress')).toBeVisible();

  // Complete flow verification
  await page.click('text=Finish');
  await expect(page.locator('text=Session complete')).toBeVisible();
});
