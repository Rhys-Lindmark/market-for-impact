import { test, expect } from '@playwright/test';
test('HCV report distinguishes central price, favorable case and funding room', async ({ page, request }) => {
  await page.goto('/charities/san-francisco-community-health-center');
  await expect(page.getByRole('heading', { name: 'San Francisco Community Health Center', exact: true })).toBeVisible();
  await expect(page.locator('.report-summary')).toContainText('$1,997,838');
  await expect(page.locator('.report-heading .report-donate')).toHaveAttribute('href', /^(https:\/\/|#funding)/);
  await expect(page.locator('body')).toContainText('No finite positive price');
  const response = await request.get('/api/sf-hcv-model');
  expect(response.ok()).toBeTruthy();
  const model = await response.json();
  expect(model.denominator).toBe('10 incremental QALYs');
  const central = model.evaluatedScenarios.find((s: { name: string }) => /central/i.test(s.name));
  expect(central.costPerTenQalys).toBeCloseTo(1997838.2309494312, 2);
  expect(central.healthYears).toHaveLength(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
