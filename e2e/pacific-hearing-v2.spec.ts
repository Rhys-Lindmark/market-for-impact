import {test,expect} from '@playwright/test';
test('Pacific Hearing V2 uses central ranking',async({page,request})=>{
 const home=await request.get('/');expect(home.ok()).toBe(true);expect(await home.text()).toContain('Friends of the Urban Forest');
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/charities/pacific-hearing-connection');await expect(page.getByRole('heading',{level:1})).toContainText('Pacific Hearing Connection');
 const body=await page.locator('article').innerText();expect(body.split(/\s+/).length).toBeGreaterThan(4900);expect(body).toContain('91.8');
 const links=page.locator('.report-contents a');for(let i=0;i<await links.count();i++){const h=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+h!.slice(1)+'"]')).toHaveCount(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.setViewportSize({width:1365,height:900});const t=await page.locator('.report-contents').boundingBox(),a=await page.locator('article').boundingBox();expect(t!.x+t!.width).toBeLessThan(a!.x);
 const r=await request.get('/api/pacific-hearing-connection-model');expect(r.ok()).toBe(true);const d=await r.json();const c=d.evaluated.rows.find((s:{id:string})=>s.id==='central');expect(c.bayCostPer10).toBeCloseTo(2199017.543859649,6);
 await page.goto('/research');await expect(page.locator('[data-research-slug="pacific-hearing-connection"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.bayCostPer10));
});
