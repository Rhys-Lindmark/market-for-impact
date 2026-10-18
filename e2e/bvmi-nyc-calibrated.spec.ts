import{test,expect}from'@playwright/test';
test('BVMI current report, API and research list agree on signed estimate',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/new-york-city/charities/bergen-volunteer-medical-initiative');
 await expect(page.getByRole('heading',{level:1,name:'Bergen Volunteer Medical Initiative',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('10 min on GPT-6.1 Sol');
 await expect(page.locator('#summary')).toContainText('$29.4M');
 await expect(page.locator('#cost')).toContainText('1.15 offered patient-equivalents');
 await expect(page.locator('#cost')).toContainText('$15.10M');
 await expect(page.locator('#cost')).toContainText('−$30.69');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/new-york-city/bergen-volunteer-medical-initiative');expect(response.ok()).toBe(true);
 const r=await response.json();expect(r.model.scenarios.length).toBe(25);
 expect(r.model.scenarios.find((s:any)=>s.id==='central').nativeOutputs.donorCombinedPrice10).toBeCloseTo(29386406.728908814,5);
 await page.goto('/new-york-city/all');const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Bergen Volunteer Medical Initiative'});
 await expect(row.locator('td').nth(0)).toContainText('$29.4M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
