import {test,expect} from '@playwright/test';
test('NEMS ordinary gift stays unestimated while diagnostic survives',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 expect((await request.get('/')).ok()).toBe(true);await page.goto('/charities/north-east-medical-services');
 const text=await page.locator('article').innerText();expect(text.split(/\s+/).length).toBeGreaterThan(8000);expect(text).toContain('94-3171797');expect(text).toContain('unestimated');
 const links=page.locator('.report-contents a');for(let i=0;i<await links.count();i++){const h=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+h!.slice(1)+'"]')).toHaveCount(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.setViewportSize({width:1365,height:900});const t=await page.locator('.report-contents').boundingBox(),a=await page.locator('article').boundingBox();expect(t!.x+t!.width).toBeLessThan(a!.x);
 const r=await request.get('/api/nems-v2-model');expect(r.ok()).toBe(true);const j=await r.json();expect(j.ordinaryGiftBayUsdPerTenQalys).toBeNull();expect(j.evaluated.central.costPerTenQalys).toBeCloseTo(1201090.5888876051,6);
 await page.goto('/research');const row=page.locator('[data-research-slug="north-east-medical-services"]');await expect(row).toHaveCount(1);await expect(row).toContainText(/Not.*estimated/i);
});
