import {test,expect} from '@playwright/test';
test('HAC V2 whole charitable gift matches the Bay research list',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/charities/housing-action-coalition');await expect(page.getByRole('heading',{level:1})).toContainText('Housing Action Coalition');
 expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(6500);
 await expect(page.getByRole('heading',{name:'Spending breakdown',exact:true})).toHaveCount(1);
 const links=page.locator('.report-contents a');for(let i=0;i<await links.count();i++){const h=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+h!.slice(1)+'"]')).toHaveCount(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.setViewportSize({width:1365,height:900});const t=await page.locator('.report-contents').boundingBox(),a=await page.locator('article').boundingBox();expect(t!.x+t!.width).toBeLessThan(a!.x);
 const r=await request.get('/api/hac-v2-model');expect(r.ok()).toBe(true);const d=await r.json();const c=d.evaluated.results.find((s:{id:string})=>s.id==='central');expect(c.bayCostPer10).toBeCloseTo(23307277.040449742,6);
 expect(d.evaluated.weightedExpectation).toBeNull();await page.goto('/research');await expect(page.locator('[data-research-slug="housing-action-coalition"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.bayCostPer10));
});
