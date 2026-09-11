import {test,expect} from '@playwright/test';
test('Bike East Bay alpha preserves central and mixture distinctions',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 const api=await request.get('/api/bike-east-bay-model');expect(api.ok()).toBe(true);const d=await api.json();const c=d.evaluated.results.find((r:{id:string})=>r.id==='central');expect(c.bayCostPer10).toBeCloseTo(104277378.90873168,5);expect(d.evaluated.bayCostPer10).toBeCloseTo(19089887.645172846,5);
 await page.goto('/charities/bike-east-bay');await expect(page.getByRole('heading',{level:1})).toHaveText('Bike East Bay');await expect(page.getByText('Draft — not published',{exact:true})).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.goto('/research');await expect(page.locator('[data-research-slug="bike-east-bay"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.bayCostPer10));await page.locator('[data-research-slug="bike-east-bay"] a').first().click();await expect(page.getByRole('heading',{level:1})).toHaveText('Bike East Bay');
});
