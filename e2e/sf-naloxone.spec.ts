import { expect, test } from '@playwright/test';

test('SFAF report has priced model, residual-overlap sensitivity and clear funding boundary', async ({ page, request }) => {
  await page.goto('/charities/san-francisco-aids-foundation');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('San Francisco AIDS Foundation');
  await expect(page.locator('#nutshell')).toContainText('$56,328');
  await expect(page.locator('#nutshell')).toContainText('conditional on additional reach');
  await expect(page.getByText('$112,655 per 10 QALYs', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const response = await request.get('/api/sf-naloxone-model');
  expect(response.ok()).toBe(true);
  const model = await response.json();
  expect(model.fundingRoom.verifiedUsd).toBeNull();
  expect(model.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(56327.57, 2);
});
