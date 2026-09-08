import {test,expect} from '@playwright/test';
test('Helen Keller keeps unquantified local programs separate from overseas core',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(55);
 const row=page.locator('[data-research-slug="helen-keller-international"]');await expect(row).toContainText('Not estimated');await row.locator('a').first().click();
 await expect(page.locator('article')).toContainText('$8,015');await expect(page.locator('article')).toContainText('US vision programs exist');
 const d=await(await page.request.get('/api/helen-keller-model')).json();expect(d.evaluated).toHaveLength(12);expect(d.evaluated[0].usdPer10GlobalQalys).toBeCloseTo(8014.83481,2);expect(d.evaluated[0].usdPer10SfQalys).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
