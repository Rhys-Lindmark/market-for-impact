import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Berkeley Free Clinic ranks by modeled Bay benefit and preserves uncertainty',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);const row=page.locator('[data-research-slug="berkeley-free-clinic"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','3850446.759027112');await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Berkeley Free Clinic');
 await expect(page.locator('#summary')).toContainText('$3.62');await expect(page.locator('.report-research-effort summary')).toContainText('on GPT-6 Astra Lite + GPT-5.6 Sol');await expect(page.locator('#funding')).toContainText('$196,809');
 const response=await page.request.get('/api/berkeley-free-clinic-model');expect(response.ok()).toBe(true);const api=await response.json();expect(api.modelVersion).toBe('berkeley-free-clinic-whole-org-v1');expect(api.evaluated.measuredBayResidentShare).toBeNull();expect(api.evaluated.verifiedCompleteGrossResourceUsdPer10Qaly).toBeNull();expect(api.evaluated.modeledBayResidentUsdPer10Qaly).toBe(3850446.759027112);expect(api.verifiedMarginalFundingOffer).toBeNull();
 await expect(page.locator('a.report-donate')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
