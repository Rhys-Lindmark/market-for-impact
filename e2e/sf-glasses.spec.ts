import { test, expect } from '@playwright/test';
test('PHC report and executable model are usable on mobile', async ({ page, request }) => {
  await page.goto('/charities/project-homeless-connect');
  await expect(page.getByRole('heading', { name: 'Project Homeless Connect', exact: true })).toBeVisible();
  await expect(page.locator('body')).toContainText('$71,111');
  await expect(page.locator('body')).toContainText('Medi-Cal');
  await expect(page.locator('body')).toContainText('Community Initiatives');
  const response = await request.get('/api/sf-glasses-model');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(71111.1111, 2);
  expect(data.fundingRoom.verifiedUsd).toBeNull();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
