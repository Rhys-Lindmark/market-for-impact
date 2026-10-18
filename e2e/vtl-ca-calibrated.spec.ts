import {test,expect} from '@playwright/test';
test('California Vision To Learn has the revised health/resource estimate, history and recorded model time',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/california/charities/vision-to-learn');
 await expect(page.getByRole('heading',{level:1,name:'Vision To Learn',exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
 await expect(page.locator('#summary')).toContainText('$4.3M');
 await expect(page.locator('#cost')).toContainText('$4,280,415.60703891');
 await expect(page.locator('#cost')).toContainText('$2,003,590.9323512588');
 await expect(page.locator('#cost')).toContainText('household');
 await expect(page.locator('#cost')).toContainText('no earnings');
 const links=page.locator('.report-contents a');
 for(let i=0;i<await links.count();i++){const href=await links.nth(i).getAttribute('href');await expect(page.locator('[id="'+href!.slice(1)+'"]')).toHaveCount(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const response=await request.get('/api/geography-reports/california/vision-to-learn');expect(response.ok()).toBe(true);
 const d=await response.json(),c=d.model.scenarios.find((s:{id:string})=>s.id==='central');
 expect(c.editionQalys).toBeCloseTo(.2322944218698827,10);
 const income=c.incomePathways.reduce((sum:number,p:{people:number;annualIncomeGainUSD:number;annualIncomeBeforeUSD:number;causalShare:number;editionShare:number;independentShare:number;delayYears:number;discountRate:number})=>sum+.5*p.people*Math.log1p(p.annualIncomeGainUSD/p.annualIncomeBeforeUSD)*p.causalShare*p.editionShare*p.independentShare/(1+p.discountRate)**p.delayYears,0);
 expect(income).toBeCloseTo(.0013277521908684907,10);
 expect(10*c.costUSD/(c.editionQalys+income)).toBeCloseTo(4280415.60703891,6);
 await page.goto('/california/all');
 const row=page.locator('[data-research-table] tbody tr').filter({hasText:'Vision To Learn'});
 await expect(row.locator('td').nth(0)).toContainText('$4.3M');
 await expect(row.locator('td').nth(1)).toContainText('$23.1M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
