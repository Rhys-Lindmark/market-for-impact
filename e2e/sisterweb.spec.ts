import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('SisterWeb exposes expense uncertainty and signed whole-project estimate',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="sisterweb"]');await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'SisterWeb Community Doula Network'})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$63.2M');
 const response=await page.request.get('/api/sisterweb-model');expect(response.ok()).toBe(true);const {evaluated:r,verifiedMarginalFundingOffer}=await response.json();
 expect(verifiedMarginalFundingOffer).toBeNull();expect(r.results[0].giftQaly).toBeLessThan(0);expect(r.results[1].giftQaly).toBe(0);
 await expect(page.locator('a.report-donate')).toHaveCount(2);
 for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://www.sisterweb.org/donate');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
