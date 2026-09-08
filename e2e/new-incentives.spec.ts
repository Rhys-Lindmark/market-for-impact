import {test,expect} from '@playwright/test';
test('New Incentives is global research, not an SF recommendation',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(53);
 const row=page.locator('[data-research-slug="new-incentives"]');await expect(row).toContainText('Not estimated');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'New Incentives',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$3,870');await expect(page.locator('article')).toContainText('March 2028');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const model=await(await page.request.get('/api/new-incentives-model')).json();expect(model.evaluated).toHaveLength(10);expect(model.evaluated[0].globalUsdPer10Qaly).toBeCloseTo(43072.99777,2);expect(model.evaluated[0].bayUsdPer10Qaly).toBeNull();
 await page.goto('/');await expect(page.locator('a[href*="/charities/new-incentives"]')).toHaveCount(0);
});
