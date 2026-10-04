import{test,expect}from'@playwright/test';
test('Lestonnac report API and full list agree on combined estimate',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/los-angeles/charities/lestonnac-free-clinic');
 await expect(page.getByRole('heading',{level:1,name:'Lestonnac Free Clinic',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('7 min on GPT-6 Astra Light');
 await expect(page.locator('.report-research-effort summary')).toContainText('11 min on GPT-6 Astra Medium');
 await expect(page.locator('.report-research-effort summary')).toContainText('57 min on GPT-6.1 Sol');
 await expect(page.locator('#cost')).toContainText('$8.02 million');
 await expect(page.locator('#cost')).toContainText('3.90 medical');
 await expect(page.locator('#cost')).toContainText('−$12.38');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/los-angeles/lestonnac-free-clinic');expect(response.ok()).toBe(true);const r=await response.json();expect(r.model.scenarios.length).toBe(33);expect(r.model.scenarios.find((s:any)=>s.id==='central').nativeOutputs.donorPrice10).toBeCloseTo(8017528.376396455,5);
 await page.goto('/los-angeles/all');const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Lestonnac Free Clinic'});await expect(row.locator('td').nth(0)).toContainText('$8.0M');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
