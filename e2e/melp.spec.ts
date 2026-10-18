import {test,expect} from '@playwright/test';
test('MELP current health and income estimate agrees across report, API and listing',async({page,request})=>{
 await page.goto('/charities/melp-ablecloset');
 await expect(page.locator('h1')).toHaveText('MELP/AbleCloset');
 await expect(page.locator('.report-heading')).not.toContainText('V2');
 await expect(page.locator('.report-research-effort summary')).toContainText('min on GPT-6.1 Sol');
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6 Astra Lite');
 await expect(page.locator('#summary')).toContainText('$3.6M');
 await expect(page.locator('[data-summary-reasons] li')).toHaveCount(3);
 await expect(page.locator('[data-summary-reservations] li')).toHaveCount(3);
 await expect(page.locator('#cost-effectiveness')).toContainText('0.0247891795');
 await expect(page.locator('#cost-effectiveness')).toContainText('0.0041120899');
 await expect(page.locator('#cost-effectiveness')).not.toContainText('Subjective weight');
 await expect(page.locator('.report-donate').first()).toHaveAttribute('href','https://www.freemedequip.org/donate/');
 for(const link of await page.locator('.report-contents a').all()){
  const href=await link.getAttribute('href');expect(href).toMatch(/^#/);await expect(page.locator(href!)).toHaveCount(1);
 }
 await expect(page.locator('#annual-expenses')).toContainText('FY2024: $104,000');
 await expect(page.locator('#annual-expenses')).toContainText('FY2023: $63,199');
 await expect(page.locator('.report-footer')).toContainText('Cost-effectiveness model: melp-health-income-calibrated');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 const response=await request.get('/api/melp-model');expect(response.ok()).toBe(true);const api=await response.json();
 expect(api.evaluated.bayUsdPerBetterLife).toBeCloseTo(3642163.81556004,5);
 expect(api.evaluated.incomeEquivalentYears).toBeGreaterThan(0);
 expect(api.diagnostics.find((r:{name:string})=>r.name==='attempted_access_burden').totalEquivalentYears).toBeLessThan(0);
 expect(api.historical.evaluated.weighted.bayDonorCostPer10Qaly).toBe(3009665.171786541);
 expect(api.verifiedMarginalFundingOffer).toBeNull();
 await page.goto('/san-francisco/all');
 const row=page.locator('tr').filter({has:page.locator('a[href="/charities/melp-ablecloset"]')});
 await expect(row).toContainText('$3.6M');
});
