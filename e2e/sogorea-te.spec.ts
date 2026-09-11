import {test,expect} from '@playwright/test';
test('Sogorea Te partial readiness report and central diagnostic',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 const api=await request.get('/api/sogorea-te-model');expect(api.ok()).toBe(true);const d=await api.json();expect(d.completeOrganizationEstimate).toBeNull();const c=d.evaluated.rows.find((r:{id:string})=>r.id==='central');expect(c.costPer10).toBeCloseTo(59202729166.66666,3);expect(d.evaluated.costPer10).toBeCloseTo(1172524756.5604882,3);
 await page.goto('/charities/sogorea-te');await expect(page.getByRole('heading',{level:1})).toHaveText('Sogorea Te Land Trust');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.goto('/research');await expect(page.locator('[data-research-slug="sogorea-te"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.costPer10));await page.locator('[data-research-slug="sogorea-te"] a').first().click();await expect(page.getByRole('heading',{level:1})).toHaveText('Sogorea Te Land Trust');
});
