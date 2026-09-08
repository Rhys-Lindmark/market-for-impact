import {test,expect} from '@playwright/test';
test('Roots preserves Bay boundary and conditional whole-gift model',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(55);
 const row=page.locator('[data-research-slug="roots-community-health"]');await expect(row).toContainText('Not estimated');await row.locator('a').first().click();
 await expect(page.locator('article')).toContainText('$3.56 million');
 const d=await(await page.request.get('/api/roots-model')).json();expect(d.evaluated).toHaveLength(12);expect(d.evaluated[0].donor_bay_per_10q).toBeCloseTo(3556793.6166,2);expect(d.evaluated[0].donor_sf_per_10q).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
