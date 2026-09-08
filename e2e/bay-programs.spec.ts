import {expect,test} from '@playwright/test';
for(const [slug,price] of [['second-harvest-silicon-valley',64596273.2919],['alameda-county-community-food-bank',248447204.9689],['food-bank-contra-costa-solano',19591836.7347]] as const){
 test(slug+' report and model agree on mobile',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/charities/'+slug);
  await expect(page.locator('main')).toContainText('not San Francisco city');
  await expect(page.locator('main')).toContainText('Unverified');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const response=await page.request.get('/api/bay-program-model?slug='+slug);expect(response.ok()).toBe(true);
  const data=await response.json();expect(data.verifiedMarginalOffer).toBe(false);
  expect(data.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(price,2);
  await expect(page.locator('main')).toContainText(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(price));
  expect(errors).toEqual([]);
 });
}
