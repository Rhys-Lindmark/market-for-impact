import { test, expect } from '@playwright/test';
test('HRTC exposes a qualified priced model on phone and tablet', async ({ page, request }) => {
  await page.goto('/charities/harm-reduction-therapy-center');
  await expect(page.getByRole('heading', { name: 'Harm Reduction Therapy Center', exact: true })).toBeVisible();
  await expect(page.locator('body')).toContainText('$5.55M');
  await expect(page.locator('body')).toContainText('not a measured HRTC result');
  const response = await request.get('/api/sf-hrtc-model');
  expect(response.ok()).toBeTruthy();
  const m = await response.json();
  expect(m.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(5548442.1608, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
