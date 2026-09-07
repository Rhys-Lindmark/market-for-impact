import { test, expect } from '@playwright/test';
test('HYA medication model preserves shared-funding and additionality boundaries', async ({ page, request }) => {
  await page.goto('/charities/homeless-youth-alliance');
  await expect(page.getByRole('heading', { name: 'Homeless Youth Alliance', exact: true })).toBeVisible();
  await expect(page.locator('body')).toContainText('$4.69M');
  await expect(page.locator('body')).toContainText('Prime-only ledgers miss subcontract exposure');
  const response = await request.get('/api/sf-hya-model');
  expect(response.ok()).toBeTruthy();
  const m = await response.json();
  expect(m.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(4687026.91166, 2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
