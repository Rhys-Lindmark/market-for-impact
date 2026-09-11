import {expect,test} from '@playwright/test';
test('Breathe whole-gift partial health agrees with Bay ranking and preserves history',async({page})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{
  const url=new URL(route.request().url());
  await route.fulfill({response:await page.request.get(url.pathname+url.search)});
 });
 await page.goto('/charities/breathe-california');
 await expect(page.getByRole('heading',{level:1})).toContainText('Breathe California');
 await expect(page.locator('main')).toContainText('Spending breakdown');
 const current=await (await page.request.get('/api/breathe-v2-model')).json();
 const central=current.evaluated.central;
 expect(central.bay.donor_per_10q).toBeCloseTo(10751762.342975779,6);
 const historical=await (await page.request.get('/api/breathe-coverage-model')).json();
 expect(historical.evaluated.find((s:{id:string})=>s.id==='central').bay.donor_per_10q).toBeCloseTo(5739210.197176861,6);
 expect(current.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(9000);
 const links=page.locator('.report-contents a');
 for(let i=0;i<await links.count();i++){
  const href=await links.nth(i).getAttribute('href');
  await expect(page.locator('[id="'+href!.slice(1)+'"]')).toHaveCount(1);
 }
 await page.setViewportSize({width:1365,height:900});
 const toc=await page.locator('.report-contents').boundingBox(),article=await page.locator('article').boundingBox();
 expect(toc!.x+toc!.width).toBeLessThan(article!.x);
 const r=await page.request.get('/api/sf-breathe-model');expect(r.ok()).toBe(true);
 const d=await r.json();expect(d.verifiedCurrentSfCessationCohort).toBe(false);
 expect(d.evaluatedScenarios[1].netQalys).toBe(.00375);
 await page.goto('/research');
 await expect(page.locator('[data-research-slug="breathe-california"]')).toHaveAttribute('data-cost-per-ten-qalys',String(central.bay.donor_per_10q));
});
