import { test, expect } from '@playwright/test';
test('HealthRIGHT exposes a two-year model and distinct funding constraints', async ({ page, request }) => {
  await page.goto('/charities/healthright-360');
  await expect(page.getByRole('heading', { name: 'HealthRIGHT 360', exact: true })).toBeVisible();
  await expect(page.locator('.report-summary')).toContainText('$26,353,957');
  await expect(page.locator('.report-heading .report-donate')).toHaveAttribute('href', /^(https:\/\/|#funding)/);
  await expect(page.locator('body')).toContainText('No finite positive price');
  const response = await request.get('/api/sf-healthright-model');
  expect(response.ok()).toBeTruthy();
  const model = await response.json();
  expect(model.denominator).toBe('10 incremental QALYs');
  expect(model.evaluatedScenarios.find((s: { name: string }) => /central/i.test(s.name)).donorCost).toBe(585705);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
