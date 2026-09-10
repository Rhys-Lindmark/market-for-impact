import {EXPECTED_RESEARCH_COUNT} from './research-contract';
import {test,expect} from '@playwright/test';
test('New Eyes publishes national estimate and hypothetical nested local shares',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="new-eyes-for-the-needy"]');await expect(row).toContainText('$31.5M');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'New Eyes for the Needy'})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$78,651');await expect(page.locator('#summary')).toContainText('$100,714');
 const d=await(await page.request.get('/api/new-eyes-model')).json();expect(d.evaluated.national.donor_per_10q).toBeCloseTo(78650.946,2);expect(d.evaluated.sf.q).toBeLessThanOrEqual(d.evaluated.bay.q);expect(d.withoutFavorable.national.donor_per_10q).toBeCloseTo(100713.563,2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
