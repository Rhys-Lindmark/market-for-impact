import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('BayLegal full cost, index, finite model and funding limits',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="bay-area-legal-aid"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','24433943.07305236');await row.locator('a').first().click();
 await expect(page.locator('h1')).toHaveText('Bay Area Legal Aid');await expect(page.locator('#summary')).toContainText('$24.43M');await expect(page.locator('#program')).toContainText('$3.896m');await expect(page.locator('#funding')).toContainText('3.57%');
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-5.6 Sol');await expect(page.locator('.report-donate')).toHaveAttribute('href','#funding');
 const r=await page.request.get('/api/baylegal-model');expect(r.ok()).toBe(true);const a=await r.json();expect(a.scenarios).toHaveLength(5);expect(a.evaluated.modeledBayUsdPer10Qaly).toBe(24433943.07305236);expect(a.verifiedMarginalFundingOffer).toBeNull();expect(a.completeSocietalResourcesUsd).toBeNull();expect(a.inputs.filingEntityEin).toBe('94-1631316');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
