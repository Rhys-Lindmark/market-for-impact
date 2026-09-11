import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('On-Site report uses patients not visits',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="on-site-dental-care-foundation"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','5322482.11340397');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('On-Site Dental Care Foundation');await expect(page.locator('#evidence')).toContainText('unduplicated');
 await expect(page.locator('.report-research-effort summary')).toContainText('6 min');
 const r=await page.request.get('/api/on-site-dental-model');expect(r.ok()).toBe(true);const a=await r.json();expect(a.evaluated.bayCostPer10).toBe(5322482.11340397);expect(a.anchors.patients).toBe(1101);expect(a.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
