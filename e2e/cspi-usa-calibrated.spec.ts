import {test,expect} from '@playwright/test';
test('CSPI report, header, API and list share the revised estimate',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/usa/charities/center-for-science-in-the-public-interest');
 await expect(page.getByRole('heading',{level:1,name:'Center for Science in the Public Interest',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('8 min on GPT-6 Astra Light + 23 min on GPT-6 Astra Medium + 9 min on GPT-6.1 Sol');
 await expect(page.locator('#cost')).toContainText('$1.13M');
 await expect(page.locator('#cost')).toContainText('once-only $3');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/usa/center-for-science-in-the-public-interest');expect(response.ok()).toBe(true);
 const report=await response.json(),central=report.model.scenarios.find((s:any)=>s.id==='central');
 expect(central.editionQalys).toBeCloseTo(.09149462556827334,12);
 expect(central.costPer10Qalys).toBeCloseTo(1125395.001315707,5);
 expect(central.incomePathways.length).toBe(3);
 await page.goto('/usa/all');
 const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Center for Science in the Public Interest'});
 await expect(row.locator('td').nth(0)).toContainText('$1.1M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
