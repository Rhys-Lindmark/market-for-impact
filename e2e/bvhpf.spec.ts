import {test,expect} from '@playwright/test';import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('BVHPF report separates Bay resident prior from verified SF service sites',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);const row=page.locator('[data-research-slug="bayview-hunters-point-foundation"]');await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
 await expect(row.locator('td small')).toHaveCount(0);await expect(row.locator('td a')).toHaveAttribute('aria-label',/Subjective modeled Bay-resident allocation:90%; measured residence unavailable/);
 const model=await (await page.request.get('/api/bvhpf-model')).json();const bay=model.geography.residenceSensitivity.find((s:{id:string})=>s.id==='subjective-central');await expect(row).toHaveAttribute('data-cost-per-ten-qalys',String(bay.bayResidentDonorCostPer10Qaly));
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1,name:'Bayview Hunters Point Foundation for Community Improvement',exact:true})).toBeVisible();await expect(page.locator('#summary')).toContainText('$236.13');
 await expect(page.locator('#funding')).toContainText('$25,611,719');
 await expect(page.locator('main')).toContainText('$363.28M');await expect(page.locator('main')).toContainText('measured residence unavailable');
 await expect(page.locator('.report-research-effort summary')).toContainText('Research time: 3.1+ min on GPT-5.6 Sol Medium');
 const response=await page.request.get('/api/bvhpf-model');expect(response.ok()).toBe(true);const {evaluated:r}=await response.json();expect(r.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeGreaterThan(236e6);expect(r.weighted.verifiedMarginalGrossCostPer10Qaly).toBeNull();
 expect(r.weighted.sfImpactShare).toBeUndefined();expect(r.weighted.serviceSiteAttributed.sfImpactShare).toBe(1);
 expect(r.inputs.sfShareOfCreditedQaly).toBeUndefined();expect(r.inputs.serviceSiteAttributed.sfShareOfCreditedQaly).toBe(1);
 await expect(page.locator('a.report-donate')).toHaveCount(2);for(const link of await page.locator('a.report-donate').all())await expect(link).toHaveAttribute('href','https://www.bayviewci.org/get-involved');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
