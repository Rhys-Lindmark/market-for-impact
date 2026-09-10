import {test,expect} from '@playwright/test';
import {EXPECTED_INTERNATIONAL_COUNT,EXPECTED_PUBLISHED_COUNT,EXPECTED_RESEARCH_COUNT} from './research-contract';

test('main research uses local estimates and archives international comparators',async({page})=>{
 await page.goto('/research');
 const rows=page.locator('[data-research-slug]');
 await expect(rows).toHaveCount(EXPECTED_RESEARCH_COUNT);
 await expect(page.locator('[data-geography="International"]')).toHaveCount(0);
 await expect(page.locator('tbody')).not.toContainText('Not estimated');
 for(const slug of ['rotacare-bay-area','roots-community-health','remedy-alliance','next-distro','sirum']){
  const row=page.locator(`[data-research-slug="${slug}"]`);
  await expect(row).toHaveCount(1);
  await expect(row.locator('td')).not.toContainText('Not estimated');
  await expect(row).toHaveAttribute('data-estimate-geography',/San Francisco|Bay Area/);
 }
 await page.goto('/archive/international-research');
 await expect(page.getByRole('heading',{level:1})).toHaveText('International research archive');
 await expect(page.locator('[data-geography="International"]')).toHaveCount(EXPECTED_INTERNATIONAL_COUNT);
 expect(EXPECTED_RESEARCH_COUNT+EXPECTED_INTERNATIONAL_COUNT).toBe(EXPECTED_PUBLISHED_COUNT);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
