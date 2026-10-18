import {test,expect} from '@playwright/test';
test('SFAF prevention health and signed resources agree across surfaces',async({page,request})=>{
 await page.goto('/charities/san-francisco-aids-foundation');
 await expect(page.getByRole('heading',{name:'San Francisco AIDS Foundation',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$1.93 million');
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
 await expect(page.locator('article')).toContainText('insurance-billing');
 await expect(page.locator('article')).toContainText('income-equivalent');
 const data=await (await request.get('/api/sfaf-portfolio-model')).json();
 expect(data.evaluated.bayUsdPerBetterLife).toBeCloseTo(1926859.6786479007,5);
 expect(data.evaluated.incomeEquivalentYears).toBe(0);
 expect(data.diagnostics.some((x:{result:{combinedYears:number}})=>x.result.combinedYears<0)).toBeTruthy();
 expect(data.historical.evaluated.length).toBeGreaterThan(3);
 const links=await page.locator('.report-toc a[href^="#"]').all();
 for(const link of links){const href=await link.getAttribute('href');expect(await page.locator(href!).count()).toBe(1);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.goto('/research');const row=page.locator('[data-research-slug="san-francisco-aids-foundation"]');
 await expect(row).toContainText('San Francisco AIDS Foundation');await expect(row).toContainText('$1.9M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
