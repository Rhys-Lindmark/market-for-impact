import {test,expect} from '@playwright/test';
test('HOPE V2 scope and complete prose match central comparison',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/charities/hope-pacifica');
 await expect(page.getByRole('heading',{level:1,name:'HOPE Pacifica'})).toBeVisible();expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(5000);
 await expect(page.locator('.report-donate')).toHaveCount(0);await expect(page.getByText('Donation route not verified.',{exact:true})).toBeVisible();
 const links=page.locator('.report-contents a');for(let i=0;i<await links.count();i++){const h=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+h!.slice(1)+'"]')).toHaveCount(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.setViewportSize({width:1365,height:900});const t=await page.locator('.report-contents').boundingBox(),a=await page.locator('article').boundingBox();expect(t!.x+t!.width).toBeLessThan(a!.x);
 const r=await request.get('/api/hope-v2-model');expect(r.ok()).toBe(true);const d=await r.json();expect(d.evaluated.centralScenario.bayCostPer10).toBeCloseTo(554659.5517271358,6);expect(d.currentEvidence.annualExpense).toBeNull();
 await page.goto('/research');await expect(page.locator('[data-research-slug="hope-pacifica"]')).toHaveAttribute('data-cost-per-ten-qalys',String(d.evaluated.centralScenario.bayCostPer10));
});
