import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('La Casa uses Bay price and preserves source, funding and partial-portfolio limits',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="la-casa-de-las-madres"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','22695319.534887027');await row.locator('a').first().click();
 await expect(page.locator('h1')).toHaveText('La Casa de las Madres');await expect(page.locator('#summary')).toContainText('$22,695,319');await expect(page.locator('#program')).toContainText('non-advocacy health pathways unquantified');
 await expect(page.locator('#funding')).toContainText('$165,000');await expect(page.locator('#funding')).toContainText('draft');
 await expect(page.locator('.report-research-effort summary')).toContainText('~21 min');
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-5.6 Sol');
 await expect(page.locator('a.report-donate').first()).toHaveAttribute('href','https://www.lacasa.org/donate');
 await expect(page.getByRole('link',{name:'Inspect the model, assumptions and scenarios'})).toHaveAttribute('href','/api/lacasa-model');
 const response=await page.request.get('/api/lacasa-model');expect(response.ok()).toBe(true);const api=await response.json();expect(api.inputs.scenarios).toHaveLength(6);expect(api.evaluated.weighted.bayDonorUsdPerTenQaly).toBe(22695319.534887027);expect(api.verifiedMarginalFundingOffer).toBeNull();expect(api.completeSocietalResourcesUsd).toBeNull();expect(api.evidenceBridge.finiteDurationYears).toBe(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
