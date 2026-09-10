import {test,expect} from '@playwright/test';import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('FUF research links to explicit SF whole-gift model',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="friends-of-the-urban-forest"]');await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
 await expect(row).not.toContainText('(Bay Area)');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Friends of the Urban Forest',exact:true})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('$1.053');
 const response=await page.request.get('/api/fuf-model');expect(response.ok()).toBe(true);const {evaluated:r}=await response.json();
 expect(r.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeGreaterThan(1e6);expect(r.weighted.favorableTailShareOfNetQaly).toBeGreaterThan(.84);
 await expect(page.locator('a.report-donate')).toHaveCount(2);
 for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://www.friendsoftheurbanforest.org/support-us');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
