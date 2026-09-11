import {test,expect} from '@playwright/test';
test('Walk SF whole-gift report and central Bay ranking',async({page})=>{
 await page.goto('/charities/walk-san-francisco');await expect(page.getByRole('heading',{level:1,name:'Walk San Francisco',exact:true})).toBeVisible();
 const article=page.locator('article');await expect(article).toContainText('$5.8M');await expect(article).toContainText('public');await expect(article).toContainText('No positive-health ratio');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const d=await(await page.request.get('/api/walk-sf-model')).json();expect(d.evaluated).toHaveLength(8);expect(d.evaluated[0].sfUsdPer10Qaly).toBeCloseTo(5798825.638,2);
 await page.goto('/research');const row=page.locator('[data-research-slug="walk-san-francisco"]');await expect(row).toContainText('$4.6M');expect(Number(await row.getAttribute('data-cost-per-ten-qalys'))).toBeCloseTo(d.evaluated[0].bayUsdPer10Qaly,2);
});
