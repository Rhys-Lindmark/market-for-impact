import {test,expect} from '@playwright/test';
test('CRA report per-model timing, current API and full list match',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/chicago/charities/chicago-recovery-alliance');
 await expect(page.getByRole('heading',{level:1,name:'Chicago Recovery Alliance',exact:true})).toBeVisible();
 for(const text of ['5 min on GPT-6 Astra Light','37 min on GPT-6 Astra Medium','13 min on GPT-6.1 Sol'])await expect(page.locator('.report-research-effort summary')).toContainText(text);
 await expect(page.locator('#cost')).toContainText('$2.64 million');
 await expect(page.locator('#cost')).toContainText('−$3.83');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/chicago/chicago-recovery-alliance');
 expect(response.ok()).toBe(true);const r=await response.json();expect(r.model.scenarios.length).toBe(44);
 expect(r.model.scenarios.find((x:any)=>x.id==='central').nativeOutputs.donorPrice10).toBeCloseTo(2637009.4823574596,5);
 await page.goto('/chicago/all');
 const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Chicago Recovery Alliance'});
 await expect(row.locator('td').nth(0)).toContainText('$2.6M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
