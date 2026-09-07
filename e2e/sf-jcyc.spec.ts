import { test, expect } from '@playwright/test';
test('JCYC report exposes mortality-only model and funding limits', async ({ page, request }) => {
  await page.goto('/charities/jcyc');
  await expect(page.getByRole('heading', { name: 'JCYC', exact: true })).toBeVisible();
  await expect(page.locator('body')).toContainText('$24.84M');
  await expect(page.locator('body')).toContainText('not annual');
  const response = await request.get('/api/sf-jcyc-model');
  expect(response.ok()).toBeTruthy();
  const m = await response.json();
  expect(m.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(24840182.6484, 2);
  expect(m.fundingRoom.verifiedUsd).toBeNull();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
