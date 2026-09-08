import { test, expect } from '@playwright/test';
test('reports without a funding destination do not expose an inert donation link', async ({ page }) => {
  await page.goto('/charities/new-door-ventures');
  await expect(page.locator('.report-heading .report-donate')).toHaveAttribute('href','#funding');
  await page.locator('.report-heading .report-donate').click();
  await expect(page.locator('#funding')).toContainText('not verified a suitable donation route');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.goto('/charities/glide');
  await expect(page.locator('.report-heading .report-donate')).toHaveAttribute('href', /^https:\/\//);
});
