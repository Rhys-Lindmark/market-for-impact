import {test,expect} from '@playwright/test';import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('BVHPF report preserves SF site assumption and funding caveats',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);const row=page.locator('[data-research-slug="bayview-hunters-point-foundation"]');await expect(row).toHaveAttribute('data-estimate-geography','San Francisco');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Bayview Hunters Point Foundation for Community Improvement',exact:true})).toBeVisible();await expect(page.locator('#summary')).toContainText('$236.13');
 await expect(page.locator('#funding')).toContainText('$25,611,719');
 const response=await page.request.get('/api/bvhpf-model');expect(response.ok()).toBe(true);const {evaluated:r}=await response.json();expect(r.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeGreaterThan(236e6);expect(r.weighted.verifiedMarginalGrossCostPer10Qaly).toBeNull();
 await expect(page.locator('a.report-donate')).toHaveCount(2);for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://www.bayviewci.org/get-involved');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
