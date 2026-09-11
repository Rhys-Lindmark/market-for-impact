import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT,EXPECTED_EXPANDED_COUNT} from './research-contract';
test('Health Mobile keeps California and Bay denominators distinct',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);await expect(page.locator('[data-research-slug="health-mobile"]')).toHaveCount(0);
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 const row=page.locator('[data-research-slug="health-mobile"]');await expect(row).toHaveAttribute('data-geography','California');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','1820396.926696199');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Health Mobile');await expect(page.locator('#evidence')).toContainText('target');
 await expect(page.locator('.report-research-effort summary')).toContainText('7 min');
 const response=await page.request.get('/api/health-mobile-model');expect(response.ok()).toBe(true);const a=await response.json();expect(a.evaluated.bayCostPer10).toBe(2041965.688426433);expect(a.evaluated.allCostPer10).toBe(1820396.926696199);expect(a.anchors.observedAnnualPatients).toBeNull();expect(a.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
