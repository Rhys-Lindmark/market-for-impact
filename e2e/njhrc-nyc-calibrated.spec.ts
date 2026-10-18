import{test,expect}from'@playwright/test';
test('NJHRC report API and research list agree on accepted signed estimate',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/new-york-city/charities/new-jersey-harm-reduction-coalition');
 await expect(page.getByRole('heading',{level:1,name:'New Jersey Harm Reduction Coalition',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('9 min on GPT-6.1 Sol');
 await expect(page.locator('#summary')).toContainText('$19.8M');
 await expect(page.locator('#cost')).toContainText('2.43 offered coverage opportunities');
 await expect(page.locator('#cost')).toContainText('$10.46M');
 await expect(page.locator('#cost')).toContainText('−$3.95');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/new-york-city/new-jersey-harm-reduction-coalition');expect(response.ok()).toBe(true);
 const r=await response.json();expect(r.model.scenarios.length).toBe(22);
 expect(r.model.scenarios.find((s:any)=>s.id==='central').nativeOutputs.donorPrice10).toBeCloseTo(19752539.732170835,5);
 await page.goto('/new-york-city/all');const row=page.locator('[data-research-table] tbody tr').filter({hasText:'New Jersey Harm Reduction Coalition'});
 await expect(row.locator('td').nth(0)).toContainText('$19.8M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
