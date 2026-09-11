import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Pacific Hearing Connection price and identity remain distinct',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="pacific-hearing-connection"]');
 await expect(row).toHaveAttribute('data-cost-per-ten-qalys','937720.9335493005');
 expect(await page.locator('[data-research-slug]').evaluateAll(rows=>rows.findIndex(r=>r.getAttribute('data-research-slug')==='pacific-hearing-connection'))).toBe(5);
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Pacific Hearing Connection');
 await expect(page.locator('#evidence')).toContainText('modifiedHUI3');
 await expect(page.locator('#evidence')).toContainText('RAND36');
 await expect(page.locator('.report-research-effort summary')).toContainText('6 min');
 const response=await page.request.get('/api/pacific-hearing-connection-model');expect(response.ok()).toBe(true);const a=await response.json();
 expect(a.evaluated.bayCostPer10).toBe(937720.9335493005);expect(a.anchors.expense).toBe(184099);
 expect(a.verifiedMarginalFundingOffer).toBeNull();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
