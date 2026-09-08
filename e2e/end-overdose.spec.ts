import {test,expect} from '@playwright/test';
test('End Overdose prices the same gift by resident geography',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(55);
 const row=page.locator('[data-research-slug="end-overdose"]');await expect(row).toContainText('(U.S.)');await row.locator('a').first().click();
 await expect(page.locator('article')).toContainText('$1.52 million');await expect(page.locator('article')).toContainText('$76.0 million');
 const d=await(await page.request.get('/api/end-overdose-model')).json();expect(d.evaluated).toHaveLength(9);expect(d.evaluated[0].sf.donor_usd_per_10_qaly).toBeGreaterThan(75e6);expect(d.evaluated[0].sf.donor_usd_per_10_qaly).toBeLessThan(77e6);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
