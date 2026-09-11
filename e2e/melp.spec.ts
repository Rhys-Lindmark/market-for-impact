import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('MELP report preserves weighted result and inspectable symmetric clinical diagnostics',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="melp-ablecloset"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','3009665.171786541');await row.locator('a').first().click();
 await expect(page.locator('h1')).toHaveText('MELP/AbleCloset');await expect(page.locator('#summary')).toContainText('$3,009,665');await expect(page.locator('#summary')).toContainText('91.8%');
 await expect(page.locator('.report-research-effort summary')).toHaveText('Research time: ~22 min on GPT-6 Astra Lite');
 await expect(page.locator('a.report-donate').first()).toHaveAttribute('href','https://www.freemedequip.org/donate/');
 await expect(page.getByRole('link',{name:'Inspect the model, assumptions and scenarios'})).toHaveAttribute('href','/api/melp-model');
 const response=await page.request.get('/api/melp-model');expect(response.ok()).toBe(true);const api=await response.json();expect(api.scenarios).toHaveLength(6);expect(api.scenarios.every((s:{mix:unknown[]})=>s.mix.length===4)).toBe(true);expect(api.evaluated.weighted.bayDonorCostPer10Qaly).toBe(3009665.171786541);expect(api.verifiedMarginalFundingOffer).toBeNull();expect(api.clinicalComparison.diagnostics).toHaveLength(4);
 const comparison=await page.request.get('/api/device-clinical-comparison');expect(comparison.ok()).toBe(true);expect((await comparison.json()).baseline.recares.weightedBayPrice).toBe(185910.27585974694);
 await page.goto('/charities/recares');await expect(page.getByRole('link',{name:'Compare shared clinical assumptions with MELP'})).toHaveAttribute('href','/api/device-clinical-comparison');await expect(page.locator('#cost-effectiveness')).toContainText('$507,197');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
