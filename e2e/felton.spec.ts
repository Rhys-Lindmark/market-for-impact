import {test,expect} from '@playwright/test';
test('Felton retains disjoint finite health and full-gift cost',async({page,request})=>{
 await page.goto('/charities/felton-institute');
 await expect(page.getByRole('heading',{level:1,name:'Felton Institute',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$42.28M');
 const donate=page.getByRole('link',{name:'Donate',exact:true});await expect(donate).toHaveCount(2);
 for(const link of await donate.all())await expect(link).toHaveAttribute('href','https://felton.org/about-us/make-a-difference/donate-now/');
 expect(await page.locator('article table').count()).toBe(0);
 const response=await request.get('/api/felton-model');expect(response.ok()).toBeTruthy();const data=await response.json();
 expect(data.evaluated).toHaveLength(18);expect(data.evaluated[0].donor_sf_per_10q).toBeGreaterThan(42.27e6);expect(data.evaluated[0].donor_sf_per_10q).toBeLessThan(42.30e6);
 expect(data.evaluated[0].unmodeled_gift_usd).toBe(70000);
 await page.goto('/research');await expect(page.locator('[data-research-slug="felton-institute"]')).toContainText('Felton Institute');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
