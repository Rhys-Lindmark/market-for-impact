import { test, expect } from '@playwright/test';
test('New Door exposes its verified official-linked donation destination', async ({ page }) => {
  await page.goto('/charities/new-door-ventures');
  await expect(page.locator('.report-heading .report-donate')).toHaveAttribute('href','https://giving.gofundme.com/campaign/778708/donate');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.goto('/charities/glide');
  await expect(page.locator('.report-heading .report-donate')).toHaveAttribute('href', /^https:\/\//);
});
