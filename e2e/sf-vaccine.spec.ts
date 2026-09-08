import {expect,test} from '@playwright/test';
test('vaccine model exposes cash inventory and proposed-delivery boundaries',async({page})=>{
  await page.goto('/charities/san-francisco-free-clinic');
  await expect(page.getByRole('heading',{level:1})).toHaveText('San Francisco Free Clinic');
  await expect(page.locator('main')).toContainText('$1,954,995');
  await expect(page.locator('main')).toContainText('cash refund');
  await expect(page.locator('main')).toContainText('Product unverified');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const r=await page.request.get('/api/sf-vaccine-model');expect(r.ok()).toBe(true);
  const j=await r.json();expect(j.verifiedMarginalOffer).toBe(false);
  expect(j.evaluatedScenarios[1].terminalDoses).toBe(14);
  expect(j.evaluatedScenarios[1].costPerTenQalys).toBeGreaterThan(1900000);
});
