import{test,expect}from'@playwright/test';
test('RAM current report/list, clinical-resource split and historical model agree',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/usa/charities/remote-area-medical');
 await expect(page.getByRole('heading',{level:1,name:'Remote Area Medical',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('~10 min on GPT-6 Astra Light + ~25 min on GPT-6 Astra Medium + ~8 min on GPT-6.1 Sol');
 await expect(page.locator('#summary')).toContainText('$5.3M');
 await expect(page.locator('#cost')).toContainText('8 additional attendance-equivalents');
 await expect(page.locator('#cost')).toContainText('−0.009359');
 await expect(page.locator('#cost')).toContainText('$1.33M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/usa/remote-area-medical');expect(response.ok()).toBe(true);
 const r=await response.json(),c=r.model.scenarios.find((s:any)=>s.id==='central');
 expect(c.nativeOutputs.combinedDonationPricePer10USD).toBeCloseTo(5255153.51704092,5);expect(r.model.scenarios.length).toBe(26);
 // The API exposes the current model; the complete archive is checked by the historical unit test.
 expect(r.model.scenarios.some((s:any)=>s.id==='historical-alpha-central')).toBe(true);
 await page.goto('/usa/all');const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Remote Area Medical'});
 await expect(row.locator('td').nth(0)).toContainText('$5.3M');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
