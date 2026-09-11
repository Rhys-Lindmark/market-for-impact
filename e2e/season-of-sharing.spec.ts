import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Season of Sharing preserves partial-benefit and whole-cost boundaries',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="season-of-sharing"]');
 await expect(row).toHaveAttribute('data-cost-per-ten-qalys','7541069.313655639');await expect(row).toContainText('food health unquantified');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Season of Sharing Fund');
 await expect(page.locator('#evidence')).toContainText('6.94');
 await expect(page.locator('.report-research-effort summary')).toContainText('9 min');
 await expect(page.locator('.report-donate').first()).toHaveAttribute('href','https://seasonofsharing.org/ways-to-give/');
 const response=await page.request.get('/api/season-of-sharing-model');expect(response.ok()).toBe(true);const a=await response.json();
 expect(a.evaluated.bayCostPer10).toBe(7541069.313655639);expect(a.inputs.wholeExpense).toBe(14799462);
 expect(a.interpretation).toContain('food-health benefits unquantified');expect(a.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
