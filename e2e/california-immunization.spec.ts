import {test,expect} from '@playwright/test';import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('CIC statewide report uses local share and corrected MMR model',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="california-immunization-coalition"]');
 await expect(row).toContainText('(California)');await expect(row).toHaveAttribute('data-estimate-geography','San Francisco');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'California Immunization Coalition',exact:true})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$41.9M');
 const response=await page.request.get('/api/california-immunization-model');expect(response.ok()).toBe(true);const {evaluated:r,verifiedMarginalFundingOffer}=await response.json();
 expect(verifiedMarginalFundingOffer).toBeNull();expect(r.inputs.cdcMmrDeathsPrevented).toBe(87600);
 expect(r.weighted.donorCostPer10Qaly).toBeGreaterThan(41e6);
 await expect(page.locator('a.report-donate')).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
