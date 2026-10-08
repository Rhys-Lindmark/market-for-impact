import{test,expect}from'@playwright/test';
test('ANRF report and list expose the current signed estimate and wage alternatives',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/usa/charities/american-nonsmokers-rights-foundation');
 await expect(page.getByRole('heading',{level:1,name:'American Nonsmokers’ Rights Foundation',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('~7 min on GPT-6 Astra Light + ~12 min on GPT-6 Astra Medium + ~5 min on GPT-6.1 Sol');
 for(const price of ['$67.6M','$28.5M','$18.1M'])await expect(page.locator('#summary')).toContainText(price);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/usa/american-nonsmokers-rights-foundation');expect(response.ok()).toBe(true);
 const r=await response.json();expect(r.model.scenarios.length).toBe(25);
 expect(r.model.scenarios.some((s:any)=>s.id==='historical-beta-central')).toBe(true);
 const c=r.model.scenarios.find((s:any)=>s.id==='central');expect(c.editionQalys).toBeCloseTo(.0035041382818365436,12);
 await page.goto('/usa/all');const row=page.locator('[data-research-table] tbody tr').filter({hasText:'American Nonsmokers’ Rights Foundation'});
 await expect(row.locator('td').nth(0)).toContainText('$67.6M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
