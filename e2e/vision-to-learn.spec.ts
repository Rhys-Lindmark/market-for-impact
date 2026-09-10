import {EXPECTED_EXPANDED_COUNT} from './research-contract';
import {test,expect} from '@playwright/test';
test('Vision To Learn report has separate national and local estimates',async({page})=>{
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 const row=page.locator('[data-research-slug="vision-to-learn"]');await expect(row).toContainText('(U.S.)');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Vision To Learn'})).toBeVisible();
 const d=await(await page.request.get('/api/vision-to-learn-model')).json();expect(d.evaluated).toHaveLength(11);expect(d.evaluated[0].donor_per10_sf).toBeCloseTo(53429092,0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
