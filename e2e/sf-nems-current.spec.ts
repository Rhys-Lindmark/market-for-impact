import {expect,test} from '@playwright/test';
test('NEMS conditional report, signed income, provenance and list boundary agree',async({page})=>{
 await page.goto('/charities/north-east-medical-services');
 await expect(page.getByRole('heading',{level:1})).toHaveText('North East Medical Services');
 const effort=page.locator('.report-research-effort');
 await expect(effort.locator('summary')).toContainText('9 min on GPT-6.1 Sol');
 await expect(effort).not.toContainText('18 min on GPT-6 Astra Light');
 await expect(page.locator('article')).toContainText('Income unknown');
 await expect(page.locator('article')).toContainText('Net adverse welfare');
 await expect(page.locator('article')).toContainText('Spending breakdown');
 expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(2300);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const links=page.locator('.report-contents a');
 for(let i=0;i<await links.count();i++){
  const href=await links.nth(i).getAttribute('href');
  await expect(page.locator('[id="'+href!.slice(1)+'"]')).toHaveCount(1);
 }
 const response=await page.request.get('/api/nems-v2-model');expect(response.ok()).toBe(true);
 const api=await response.json();
 expect(api.evaluated.bay.partialHealthUsdPerTen).toBeCloseTo(1201090.5888876051,6);
 expect(api.evaluated.bay.combinedUsdPerTen).toBeNull();
 expect(api.ordinaryGiftBayUsdPerTenQalys).toBeNull();
 expect(api.diagnostics.adverseCash.cashEquivalentYears).toBeLessThan(0);
 expect(api.historical.evaluated.central.costPerTenQalys).toBeCloseTo(1201090.5888876051,6);
 await page.goto('/san-francisco/all');
 const row=page.locator('[data-research-slug="north-east-medical-services"]');
 await expect(row).toContainText('$1.2M');
 await expect(row).toContainText('conditional HBV health; income and ordinary-gift total unknown');
 expect(await row.getAttribute('data-cost-per-ten-qalys')).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
