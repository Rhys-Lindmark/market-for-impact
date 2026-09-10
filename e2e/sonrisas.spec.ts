import {test,expect} from '@playwright/test';import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Sonrisas links Bay scope to signed finite health model',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="sonrisas-dental-health"]');await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Sonrisas Dental Health'})).toBeVisible();
 await expect(page.locator('#summary')).toContainText('76.9%');
 const response=await page.request.get('/api/sonrisas-model');expect(response.ok()).toBe(true);const {evaluated:r}=await response.json();
 expect(r.weighted.verifiedMarginalGiftCostPer10Qaly).toBeNull();expect(r.scenarios[0].netQaly).toBeLessThan(0);
 await expect(page.locator('a.report-donate')).toHaveCount(2);
 for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://sonrisasdental.org/give/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
