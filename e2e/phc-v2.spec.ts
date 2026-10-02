import {test,expect} from '@playwright/test';
test('PHC V2 full report and preserved Bay estimate',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/charities/project-homeless-connect');await expect(page.getByRole('heading',{level:1})).toContainText('Project Homeless Connect');
 const body=await page.locator('article').innerText();expect(body.split(/\s+/).length).toBeGreaterThan(6000);expect(body).toContain('Bridge Campaign');expect(body).toContain('post-cut');
 const links=page.locator('.report-contents a');for(let i=0;i<await links.count();i++){const h=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+h!.slice(1)+'"]')).toHaveCount(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.setViewportSize({width:1365,height:900});const t=await page.locator('.report-contents').boundingBox(),a=await page.locator('article').boundingBox();expect(t!.x+t!.width).toBeLessThan(a!.x);
 const r=await request.get('/api/phc-portfolio-model');expect(r.ok()).toBe(true);const d=await r.json();const c=d.evaluated.find((s:{id:string})=>s.id==='central');expect(c.donor_bay_per_10q).toBeCloseTo(1502592.5677180092,6);
 expect(c.incomeBay).toBeGreaterThan(0);expect(d.model.model_id).toBe('phc-independent-health-income-current-2026-10-01');
 expect(body).toContain('$1,502,593');expect(body).toContain('not the current ranking');
 await page.goto('/san-francisco/all');await expect(page.locator('[data-research-slug="project-homeless-connect"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.donor_bay_per_10q));
});
