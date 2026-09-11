import {test,expect} from '@playwright/test';
test('PVF whole-gift report and Bay ranking agree without erasing conditional history',async({page})=>{
 await page.goto('/charities/pacific-vision-foundation');
 await expect(page.locator('#summary')).toContainText('$7.94M');
 await expect(page.locator('#summary')).toContainText('remaining 90%');
 const response=await page.request.get('/api/pvf-portfolio-model');
 expect(response.ok()).toBe(true);
 const model=await response.json();
 expect(model.evaluated.central.prices.bay.donor).toBeCloseTo(7936507.936507935,6);
 expect(model.verifiedMarginalFundingOffer).toBeNull();
 const old=await (await page.request.get('/api/sf-surgical-access-models')).json();
 expect(old.pvf.evaluatedCore.find((s:{name:string})=>s.name==='central').costPerTenQalys).toBeCloseTo(714285.7142857143,6);
 await page.goto('/research');
 await expect(page.locator('[data-research-slug="pacific-vision-foundation"]')).toHaveAttribute('data-cost-per-ten-qalys',String(model.evaluated.central.prices.bay.donor));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
