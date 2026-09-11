import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT,EXPECTED_EXPANDED_COUNT} from './research-contract';
test('MiracleFeet is an international comparator with inspectable finite QALYs and zero Bay credit',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);await expect(page.locator('[data-research-slug="miraclefeet"]')).toHaveCount(0);
 await page.getByRole('link',{name:'Expanded Geography Research',exact:true}).click();await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 const row=page.locator('[data-research-slug="miraclefeet"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','22478.885416149296');await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('MiracleFeet');
 await expect(page.locator('#summary')).toContainText('$22,479');await expect(page.locator('.report-research-effort summary')).toContainText('on GPT-6 Astra Lite + GPT-5.6 Sol');
 const response=await page.request.get('/api/miraclefeet-model');expect(response.ok()).toBe(true);const api=await response.json();expect(api.modelVersion).toBe('miraclefeet-v5-explicit-prior-finite-qaly');expect(api.evaluated.weighted.bayDirectHealthShare).toBe(0);expect(api.evaluated.weighted.verifiedCompleteGrossResourceCostPer10Qaly).toBeNull();expect(api.evaluated.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeCloseTo(22478.885416149296,8);expect(api.verifiedMarginalFundingOffer).toBeNull();
 await expect(page.locator('a.report-donate')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
