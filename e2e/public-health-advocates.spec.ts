import {test,expect} from '@playwright/test';import {EXPECTED_EXPANDED_COUNT} from './research-contract';
test('PHAdvocates prices local health without hiding uncertainty',async({page})=>{
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 const row=page.locator('[data-research-slug="public-health-advocates"]');await expect(row).toContainText('(California)');await expect(row).toHaveAttribute('data-geography','California');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Public Health Advocates',exact:true})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$78.8M');
 const response=await page.request.get('/api/public-health-advocates-model');expect(response.ok()).toBe(true);const {evaluated:r}=await response.json();expect(r.weighted.donorCostPer10Qaly).toBeGreaterThan(78e6);expect(r.weighted.sfImpactShare).toBe(.02);
 await expect(page.locator('a.report-donate')).toHaveCount(2);
 for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://publichealthadvocates.salsalabs.org/donate');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
