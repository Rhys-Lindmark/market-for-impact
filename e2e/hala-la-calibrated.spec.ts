import {test,expect} from '@playwright/test';
test('HALA report, per-model timing, API and list use current combined comparison',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/los-angeles/charities/hunger-action-los-angeles');
 await expect(page.getByRole('heading',{level:1,name:'Hunger Action Los Angeles',exact:true})).toBeVisible();
 for(const text of ['16 min on GPT-6 Astra Medium','10 min on GPT-6.1 Sol'])await expect(page.locator('.report-research-effort summary')).toContainText(text);
 await expect(page.locator('#cost')).toContainText('$10.05 million');
 await expect(page.locator('#cost')).toContainText('restricted');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/los-angeles/hunger-action-los-angeles');
 expect(response.ok()).toBe(true);const r=await response.json();expect(r.model.scenarios.length).toBe(41);
 expect(r.model.scenarios.find((x:any)=>x.id==='central').nativeOutputs.donorPrice10).toBeCloseTo(10050431.271134442,5);
 await page.goto('/los-angeles/all');
 const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Hunger Action Los Angeles'});
 await expect(row.locator('td').nth(0)).toContainText('$10.1M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
