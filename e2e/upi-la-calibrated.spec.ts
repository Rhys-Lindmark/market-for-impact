import{test,expect}from'@playwright/test';
test('UPI report header, native pathways, API and research list agree',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/los-angeles/charities/urban-peace-institute');
 await expect(page.getByRole('heading',{level:1,name:'Urban Peace Institute',exact:true})).toBeVisible();
 for(const text of ['10 min on GPT-6 Astra Light','16 min on GPT-6 Astra Medium','11 min on GPT-6.1 Sol'])await expect(page.locator('.report-research-effort summary')).toContainText(text);
 await expect(page.locator('#cost')).toContainText('$61.2 million');await expect(page.locator('#cost')).toContainText('0.404 participant-year');await expect(page.locator('#cost')).toContainText('−$3.03');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/los-angeles/urban-peace-institute');expect(response.ok()).toBe(true);const r=await response.json();expect(r.model.scenarios.length).toBe(37);expect(r.model.scenarios.find((x:any)=>x.id==='central').nativeOutputs.donorPrice10).toBeCloseTo(61194667.388702735,5);
 await page.goto('/los-angeles/all');const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Urban Peace Institute'});await expect(row.locator('td').nth(0)).toContainText('$61.2M');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
