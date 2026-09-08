import {expect,test} from '@playwright/test';
test('Dental research exposes conditional earlier relief and payer boundary',async({page})=>{
 await page.goto('/charities/clinic-by-the-bay');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Clinic by the Bay');
 await expect(page.locator('main')).toContainText('$933,333');
 await expect(page.locator('main')).toContainText('not a causal extraction effect');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const r=await page.request.get('/api/sf-dental-model');expect(r.ok()).toBe(true);
 const d=await r.json();expect(d.verifiedMarginalOffer).toBe(false);
 expect(d.evaluatedScenarios[1].netQalys).toBeCloseTo(.00375,10);
});
