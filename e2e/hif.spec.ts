import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('HIF partial pathway and whole denominator stay explicit',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="housing-industry-foundation"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','80759258.37159649');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Housing Industry Foundation');await expect(page.locator('#summary')).toContainText('not a complete valuation');
 await expect(page.locator('.report-research-effort summary')).toContainText('7 min');await expect(page.locator('.report-donation-note')).toContainText('all HIF programs');
 const response=await page.request.get('/api/hif-model');expect(response.ok()).toBe(true);const a=await response.json();expect(a.evaluated.bayCostPer10).toBe(80759258.37159649);expect(a.inputs.households).toBe(502);expect(a.verifiedMarginalFundingOffer).toBeNull();expect(a.evaluated.favorableShare).toBeGreaterThan(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
