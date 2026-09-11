import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('BATS retains whole cost and finite mortality model',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="berkeley-addiction-treatment-services"]');
 await expect(row).toHaveAttribute('data-cost-per-ten-qalys','36290154.70932942');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Berkeley Addiction Treatment Services');
 await expect(page.locator('#evidence')).toContainText('165');await expect(page.locator('.report-research-effort summary')).toContainText('5 min');
 await page.getByRole('link',{name:'Funding limitations',exact:true}).click();await expect(page.locator('#funding')).toBeVisible();
 const r=await page.request.get('/api/bats-model');expect(r.ok()).toBe(true);const a=await r.json();expect(a.evaluated.bayCostPer10).toBe(36290154.70932942);expect(a.anchors.expense).toBe(1371759);expect(a.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
