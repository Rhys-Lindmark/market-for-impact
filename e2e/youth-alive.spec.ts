import {test,expect} from '@playwright/test';import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Youth ALIVE keeps Bay scope and corrected health model',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="youth-alive"]');await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Youth ALIVE!',exact:true})).toBeVisible();await expect(page.locator('#summary')).toContainText('$27.34M');
 const response=await page.request.get('/api/youth-alive-model');expect(response.ok()).toBe(true);const {evaluated:r}=await response.json();expect(r.inputs.chongReportedFiveYearIncrementalQaly).toBeCloseTo(.02);expect(r.weighted.sfQaly).toBe(0);
 await expect(page.locator('a.report-donate')).toHaveCount(2);for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://www.youthalive.org/donate/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
