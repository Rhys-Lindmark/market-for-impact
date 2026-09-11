import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Face to Face uses finite unique-person survival',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="face-to-face"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','1328756.9378336074');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Face to Face — Sonoma County AIDS Network');await expect(page.locator('#evidence')).toContainText('prospective');
 await expect(page.locator('.report-research-effort summary')).toContainText('9 min');
 const r=await page.request.get('/api/face-to-face-model');expect(r.ok()).toBe(true);const a=await r.json();expect(a.evaluated.bayCostPer10).toBe(1328756.9378336074);expect(a.anchors.expense).toBe(2263089);expect(a.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
