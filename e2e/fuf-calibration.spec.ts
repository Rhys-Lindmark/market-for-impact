import {test,expect} from '@playwright/test';
test('FUF current health and income calibration is consistent and readable',async({page,request})=>{
 await page.goto('/charities/friends-of-the-urban-forest');
 await expect(page.getByRole('heading',{name:'Friends of the Urban Forest',exact:true})).toBeVisible();
 await expect(page.locator('.report-heading')).not.toContainText('V2');
 await expect(page.locator('.report-research-effort summary')).toContainText('min on GPT-6.1 Sol');
 await page.locator('.report-research-effort summary').click();
 await expect(page.locator('.report-research-effort')).toContainText('Calibration:');
 await expect(page.locator('#research-summary')).toContainText('$6.6M');
 await expect(page.locator('#research-cost')).toContainText('0.1474827924');
 await expect(page.locator('#research-cost')).toContainText('0.0040847089');
 await expect(page.locator('.report-heading .report-donate')).toHaveAttribute('href','https://give.friendsoftheurbanforest.org/give/376943');
 await expect(page.locator('.report-footer')).toContainText('Cost-effectiveness model:');
 for(const link of await page.locator('.report-contents a').all()){
  const href=await link.getAttribute('href');expect(href).toMatch(/^#/);await expect(page.locator(href!)).toHaveCount(1);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 const response=await request.get('/api/fuf-model');expect(response.ok()).toBe(true);const api=await response.json();
 expect(api.evaluated.costPerBetterLifeUSD).toBeCloseTo(6597720.431253185,5);
 expect(api.evaluated.incomeEquivalentYears).toBeGreaterThan(0);
 expect(api.historical.evaluated.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeCloseTo(941689.0826917188,5);
 await page.goto('/san-francisco/all');
 const row=page.locator('tr').filter({has:page.locator('a[href="/charities/friends-of-the-urban-forest"]')});
 await expect(row).toContainText('$6.6M');
});
