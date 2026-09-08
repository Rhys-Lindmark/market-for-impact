import { expect, test } from '@playwright/test';

test('EDC reports its subjective 10-QALY model instead of withholding all estimates', async ({ page, request }) => {
  await page.goto('/charities/eviction-defense-collaborative');
  await expect(page.locator('#summary')).toContainText('$126M');
  await expect(page.locator('#summary')).toContainText('subjective health bridge');
  await page.getByText('QALY conversion assumptions',{exact:true}).click();
  await expect(page.getByText('No eviction-specific preference-based utility estimate was found.', { exact: false })).toBeVisible();
  await expect(page.getByText('Eight evidence gates failed', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const response = await request.get('/api/sf-edc-qaly-model');
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.evaluatedScenarios[1].costPerTenQalys).toBe(126000000);
  expect(data.evaluatedScenarios[1].qalysPerOutcome).toBe(0.01);
});
