import {expect,test} from '@playwright/test';
test('Breathe whole-gift partial health agrees with Bay ranking and preserves history',async({page})=>{
 await page.goto('/charities/breathe-california');
 await expect(page.getByRole('heading',{level:1})).toContainText('Breathe California');
 await expect(page.locator('main')).toContainText('$5,739,210');
 await expect(page.locator('main')).toContainText('not complete whole-organization expected value');
 const current=await (await page.request.get('/api/breathe-coverage-model')).json();
 const central=current.evaluated.find((s:{id:string})=>s.id==='central');
 expect(central.bay.donor_per_10q).toBeCloseTo(5739210.197176861,6);
 expect(current.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const r=await page.request.get('/api/sf-breathe-model');expect(r.ok()).toBe(true);
 const d=await r.json();expect(d.verifiedCurrentSfCessationCohort).toBe(false);
 expect(d.evaluatedScenarios[1].netQalys).toBe(.00375);
 await page.goto('/research');
 await expect(page.locator('[data-research-slug="breathe-california"]')).toHaveAttribute('data-cost-per-ten-qalys',String(central.bay.donor_per_10q));
});
