import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Oakland EDC distinguishes clients from causal outcomes',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="oakland-eviction-defense-center"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','21354853.075793754');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('Eviction Defense Center — Oakland');await expect(page.locator('#evidence')).toContainText('descriptive');
 await expect(page.locator('.report-research-effort summary')).toContainText('6 min');
 const r=await page.request.get('/api/oakland-edc-model');expect(r.ok()).toBe(true);const a=await r.json();expect(a.evaluated.bayCostPer10).toBe(21354853.075793754);expect(a.anchors.clients).toBe(1200);expect(a.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
