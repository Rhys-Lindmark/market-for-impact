import {EXPECTED_RESEARCH_COUNT} from './research-contract';
import {test,expect} from '@playwright/test';
test('YMCA research ranks the whole gift and preserves program history',async({page})=>{
 await page.goto('/research');
 await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="ymca-greater-sf"]');
 await expect(row).toContainText('$9.5M');
 await row.locator('a').first().click();
 await expect(page.locator('article')).toContainText('30%');
 await expect(page.locator('article')).toContainText('assuming distinct health increments');
 await expect(page.locator('article')).not.toContainText('favorable scenario reaches about $80,000');
 const d=await(await page.request.get('/api/ymca-portfolio-model')).json();
 expect(d.evaluated).toHaveLength(7);
 expect(d.evaluated[0].sfUsdPer10Qaly).toBeCloseTo(9503646.58971805,2);
 expect(d.evaluated[5].bayIncludingSfNetQaly).toBeLessThan(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
