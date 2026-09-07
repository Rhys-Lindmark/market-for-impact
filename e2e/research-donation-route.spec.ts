import { test, expect } from '@playwright/test';
test('reports without a funding destination do not expose an inert donation link', async ({ page }) => {
  await page.goto('/charities/new-door-ventures');
  await expect(page.getByText('Funding route unverified', {exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'Donation route ↗'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.goto('/charities/glide');
  await expect(page.getByRole('link', {name:'Donation route ↗'})).toHaveAttribute('href', /^https:\/\//);
});
