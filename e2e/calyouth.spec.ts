import {test,expect} from '@playwright/test';import {EXPECTED_EXPANDED_COUNT} from './research-contract';
test('CalYouth separates statewide from SF cost-effectiveness',async({page})=>{
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 const row=page.locator('[data-research-slug="california-coalition-for-youth"]');await expect(row).toHaveAttribute('data-geography','California');await expect(row).toContainText('(California)');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'California Coalition for Youth',exact:true})).toBeVisible();await expect(page.locator('#summary')).toContainText('$440');
 const response=await page.request.get('/api/calyouth-model');expect(response.ok()).toBe(true);const {evaluated:r}=await response.json();expect(r.weighted.donorCostPer10Qaly).toBeGreaterThan(440000);expect(r.weighted.sfImpactShare).toBeCloseTo(.02);
 await expect(page.locator('a.report-donate')).toHaveCount(2);for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://calyouth.org/donate/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
