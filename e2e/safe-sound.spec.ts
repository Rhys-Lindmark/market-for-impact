import {test,expect} from '@playwright/test';import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Safe & Sound preserves whole-org uncertainty and SF model',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="safe-and-sound"]');await expect(row).toHaveAttribute('data-estimate-geography','San Francisco');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Safe & Sound',exact:true})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$505');
 const response=await page.request.get('/api/safe-sound-model');expect(response.ok()).toBe(true);const {evaluated:r,verifiedMarginalFundingOffer}=await response.json();
 expect(verifiedMarginalFundingOffer).toBeNull();expect(r.scenarios[0].giftQaly).toBeLessThan(0);expect(r.scenarios[1].giftQaly).toBe(0);
 await expect(page.locator('a.report-donate')).toHaveCount(2);
 for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://safeandsound.org/?campaign=751530');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
