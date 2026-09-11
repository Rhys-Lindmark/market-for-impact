import {test,expect} from '@playwright/test';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Bay-first table selects all explicit Bay outputs and homepage shares its price',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 for(const item of researchCostRanking.filter(r=>Object.hasOwn(r,'bayUsdPerTenQalys'))){
  const row=page.locator(`[data-research-slug="${item.slug}"]`);
  await expect(row).toHaveAttribute('data-estimate-geography','Bay Area');
  await expect(row).toHaveAttribute('data-cost-per-ten-qalys',String(item.bayUsdPerTenQalys));
  await expect(row.locator('td a')).toHaveAttribute('aria-label',/per 10 Bay Area QALYs/);
 }
 const slugs=await page.locator('[data-research-slug]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-research-slug')));
 expect(slugs.indexOf('spur')).toBeLessThan(slugs.indexOf('operation-access'));
 await page.goto('/');await expect(page.locator('#project-homeless-connect')).toContainText('$774K');
 const response=await page.request.get('/api/phc-portfolio-model');expect(response.ok()).toBe(true);
 const central=(await response.json()).evaluated.find((s:{id:string})=>s.id==='central');
 expect(central.donor_sf_per_10q).toBe(798863.3403891586);expect(central.donor_bay_per_10q).toBe(774408.3401731638);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
