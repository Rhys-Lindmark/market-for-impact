import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Ceres report preserves null findings, whole-gift model and Bay scope',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="ceres-community-project"]');
 await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
 await row.locator('a').first().click();
 await expect(page.getByRole('heading',{level:1,name:'Ceres Community Project'})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$258.2M');
 const response=await page.request.get('/api/ceres-community-model');expect(response.ok()).toBe(true);
 const {evaluated:r}=await response.json();expect(r.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeGreaterThan(258e6);
 expect(r.scenarios[0].giftQaly).toBe(0);expect(r.weighted.verifiedMarginalGiftCostPer10Qaly).toBeNull();
 await expect(page.locator('a.report-donate')).toHaveCount(2);
 for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://support.ceresproject.org/campaign/750741/donate');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
