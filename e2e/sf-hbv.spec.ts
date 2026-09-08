import { test, expect } from '@playwright/test';
test('HBV report keeps lifetime calibration, recurring costs and funding caveats visible', async ({ page, request }) => {
  await page.goto('/charities/north-east-medical-services');
  await expect(page.getByRole('heading', {name:'North East Medical Services',exact:true})).toBeVisible();
  await expect(page.locator('.charity-summary')).toContainText('$1,201,091');
  await expect(page.locator('.charity-report-funding-status')).toContainText('Funding route unverified');
  await expect(page.locator('body')).toContainText('not recreate');
  const response = await request.get('/api/sf-hbv-model');
  expect(response.ok()).toBeTruthy();
  const model = await response.json();
  expect(model.denominator).toBe('10 incremental QALYs');
  const central = model.evaluatedScenarios.find((s:{name:string}) => /central/i.test(s.name));
  expect(central.costPerTenQalys).toBeCloseTo(1201090.5888876051,2);
  expect(central.years).toHaveLength(35);
  expect(central.years.filter((y:{discountedDonorCostPerPerson:number})=>y.discountedDonorCostPerPerson>0)).toHaveLength(20);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
