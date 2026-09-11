import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Dentists on Wheels report, price and model remain consistent',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="dentists-on-wheels"]');
 await expect(row).toHaveAttribute('data-cost-per-ten-qalys','1584847.6979501315');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Dentists on Wheels');
 await expect(page.locator('#evidence')).toContainText('512');
 await expect(page.locator('.report-research-effort summary')).toContainText('6 min');
 await page.getByRole('link',{name:'Funding limitations',exact:true}).click();await expect(page.locator('#funding')).toBeVisible();
 const response=await page.request.get('/api/dentists-on-wheels-model');expect(response.ok()).toBe(true);const a=await response.json();
 expect(a.evaluated.bayCostPer10).toBe(1584847.6979501315);expect(a.anchors.patients).toBe(249);expect(a.anchors.procedures).toBe(512);
 expect(a.verifiedMarginalFundingOffer).toBeNull();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
