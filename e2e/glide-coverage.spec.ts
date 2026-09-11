import {test,expect} from '@playwright/test';
test('GLIDE partial whole-gift report matches Bay comparison and retains history',async({page})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await page.request.get(u.pathname+u.search)});});
 await page.goto('/charities/glide');
 await expect(page.getByRole('heading',{level:1})).toContainText('GLIDE Foundation');
 expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(10000);
 await expect(page.getByRole('heading',{name:'Spending breakdown',exact:true})).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const r=await page.request.get('/api/glide-coverage-model');expect(r.ok()).toBe(true);
 const m=await r.json();expect(m.evaluated).toHaveLength(20);
 const c=m.evaluated.find((s:{id:string})=>s.id==='central').outputs;
 expect(c.bay.donor_per_10q).toBeCloseTo(4890656.595775775,6);
 expect(m.verifiedMarginalFundingOffer).toBeNull();
 const v2=await (await page.request.get('/api/glide-v2-model')).json();expect(v2.evaluated.central.bay.donor_per_10q).toBe(c.bay.donor_per_10q);
 const links=page.locator('.report-contents a');for(let i=0;i<await links.count();i++){const href=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+href!.slice(1)+'"]')).toHaveCount(1);}
 await page.setViewportSize({width:1365,height:900});const toc=await page.locator('.report-contents').boundingBox(),article=await page.locator('article').boundingBox();expect(toc!.x+toc!.width).toBeLessThan(article!.x);
 await page.goto('/archive/glide-rental-assistance');
 await expect(page.locator('main')).toContainText('39 households');
 await page.goto('/research');
 await expect(page.locator('[data-research-slug="glide"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.bay.donor_per_10q));
});
