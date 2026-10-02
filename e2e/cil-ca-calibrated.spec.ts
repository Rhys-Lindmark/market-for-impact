import {test,expect} from '@playwright/test';
test('CIL report, resource-aware API and California list agree',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/california/charities/center-for-independent-living');
 await expect(page.getByRole('heading',{level:1,name:'Center for Independent Living',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
 await expect(page.locator('#cost')).toContainText('$146.4 million');
 await expect(page.locator('#cost')).toContainText('$59,187,952.33');
 await expect(page.locator('#cost')).toContainText('household resources');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/california/center-for-independent-living');expect(response.ok()).toBe(true);
 const d=await response.json(),s=d.model.scenarios.find((s:any)=>s.id==='central');expect(s.editionQalys).toBeCloseTo(.005069201045971627,12);
 const income=s.incomePathways.reduce((sum:number,p:any)=>sum+.5*p.people*Math.log1p(p.annualIncomeGainUSD/p.annualIncomeBeforeUSD)*p.causalShare*p.editionShare*p.independentShare/(1+p.discountRate)**p.delayYears,0);
 expect(income).toBeCloseTo(.0017596330340520494,12);
 await page.goto('/california/all');const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Center for Independent Living'});
 await expect(row.locator('td').nth(0)).toContainText('$146.4M');await expect(row.locator('td').nth(1)).toContainText('$3.7M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
