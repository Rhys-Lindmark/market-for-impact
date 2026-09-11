import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT,EXPECTED_EXPANDED_COUNT} from './research-contract';
test('ReCARES exposes weighted Bay assumptions, limitations, model and whole-gift giving route',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="recares"]');await expect(row).toHaveAttribute('data-cost-per-ten-qalys','185910.27585974694');await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
 await row.locator('a').first().click();await expect(page.locator('h1')).toHaveText('The ReCARES Network');
 await expect(page.locator('#summary')).toContainText('$185,910');await expect(page.locator('#summary')).toContainText('69.3%');
 await expect(page.locator('#evidence')).toContainText('no between-group quality-of-life effect');await expect(page.locator('#funding')).toContainText('$10k');
 await expect(page.locator('.report-research-effort summary')).toHaveText('Research time: ~13 min on GPT-6 Astra Lite');
 await expect(page.locator('a.report-donate').first()).toHaveAttribute('href','https://www.recares.org/financial-donations/');
 const link=page.getByRole('link',{name:'Inspect the model, assumptions and scenarios'});await expect(link).toHaveAttribute('href','/api/recares-model');
 const response=await page.request.get('/api/recares-model');expect(response.ok()).toBe(true);const api=await response.json();expect(api.scenarios).toHaveLength(5);expect(api.scenarios.every((s:{mix:unknown[]})=>s.mix.length===3)).toBe(true);expect(api.evaluated.weighted.bayDonorCostPer10Qaly).toBe(185910.27585974694);expect(api.verifiedMarginalFundingOffer).toBeNull();expect(api.evaluated.completeSocietalResourcesUsd).toBeNull();
 await page.goto('/');await expect(page.locator('.sf-home-charity')).toHaveCount(4);await expect(page.locator('.sf-home-charity').first()).toHaveAttribute('id','recares');await expect(page.locator('#recares')).toContainText('$186K');await expect(page.locator('#recares')).toContainText('not a verified giving recommendation');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);await expect(page.locator('[data-research-slug="recares"]')).toHaveCount(0);
});
