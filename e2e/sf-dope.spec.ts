import { test, expect } from '@playwright/test';
test('DOPE exposes site-year estimate, null harms and non-additive funding boundaries', async ({ page, request }) => {
  await page.goto('/charities/national-harm-reduction-coalition');
  await expect(page.getByRole('heading', { name: 'National Harm Reduction Coalition', exact: true })).toBeVisible();
  await expect(page.locator('.charity-summary')).toContainText('$2,425,273');
  await expect(page.locator('body')).toContainText('resident-person-years');
  await expect(page.locator('body')).toContainText('not an additive portfolio tranche');
  await expect(page.locator('.charity-report-funding-status')).toContainText('Funding route unverified');
  const response = await request.get('/api/sf-dope-model');
  expect(response.ok()).toBeTruthy();
  const model = await response.json();
  const central = model.evaluatedScenarios.find((s: { name: string }) => /central/i.test(s.name));
  expect(central.additionalDeathsPrevented).toBe(.024);
  expect(central.requiredDeathsFor100k).toBeGreaterThan(.3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
