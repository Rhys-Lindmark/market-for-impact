import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('NFP research links to the whole-gift model with local allocation caveats',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="nurse-family-partnership"]');await expect(row).toContainText('Changent');await expect(row).toHaveAttribute('data-cost-per-ten-qalys',String(7552004288.8441725));
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Changent / Nurse-Family Partnership',exact:true})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$15.10');await expect(page.locator('main')).toContainText('not measured local allocation');
 const response=await page.request.get('/api/nfp-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.modelVersion).toBe('nurse-family-partnership-v2-unit-aligned');expect(data.evaluated.weighted.sfImpactShare).toBe(.002);expect(data.verifiedMarginalFundingOffer).toBeNull();
 await expect(page.locator('a.report-donate')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
