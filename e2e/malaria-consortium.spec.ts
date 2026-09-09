import {EXPECTED_RESEARCH_COUNT} from './research-contract';
import {test,expect} from '@playwright/test';
test('Malaria Consortium whole gift is global research with explicit allocation',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const row=page.locator('[data-research-slug="malaria-consortium"]');await expect(row).toContainText('Not estimated');
 await row.locator('a').first().click();await expect(page.locator('article')).toContainText('$5,496');await expect(page.locator('article')).toContainText('50%');
 const d=await(await page.request.get('/api/malaria-consortium-model')).json();expect(d.evaluated).toHaveLength(12);expect(d.evaluated[0].usdPer10GlobalQalys).toBeCloseTo(5495.886728,2);
 expect(d.evaluated[0].usdPer10SfQalys).toBeNull();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
