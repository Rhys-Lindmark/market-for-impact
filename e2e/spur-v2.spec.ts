import {test,expect} from '@playwright/test';
test('SPUR full V2 report and central ranking remain aligned',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/charities/spur');
 await expect(page.getByRole('heading',{level:1,name:'SPUR',exact:true})).toBeVisible();
 expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(7000);
 await expect(page.getByRole('heading',{name:'Spending breakdown',exact:true})).toHaveCount(1);
 const links=page.locator('.report-contents a');
 for(let i=0;i<await links.count();i++){const href=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+href!.slice(1)+'"]')).toHaveCount(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.setViewportSize({width:1365,height:900});
 const toc=await page.locator('.report-contents').boundingBox(),article=await page.locator('article').boundingBox();expect(toc!.x+toc!.width).toBeLessThan(article!.x);
 const r=await request.get('/api/spur-v2-model');expect(r.ok()).toBe(true);const d=await r.json();
 const c=d.evaluated.find((s:{id:string})=>s.id==='central');expect(c.bayUsdPer10Qaly).toBeCloseTo(2191060.473269062,6);
 expect(c.weightedExpectation).toBeNull();expect(d.verifiedMarginalFundingOffer).toBeNull();
 await page.goto('/research');await expect(page.locator('[data-research-slug="spur"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.bayUsdPer10Qaly));
});
