import {test,expect} from '@playwright/test';
import {EXPECTED_EXPANDED_COUNT,EXPECTED_PUBLISHED_COUNT,EXPECTED_RESEARCH_COUNT} from './research-contract';
test('Bay-only list and expanded geography archive preserve all reports',async({page})=>{
 await page.goto('/research');const rows=page.locator('[data-research-slug]');await expect(rows).toHaveCount(EXPECTED_RESEARCH_COUNT);
 await expect(page.locator('tbody')).not.toContainText('(Bay Area)');await expect(page.locator('tbody')).not.toContainText('(California)');await expect(page.locator('tbody')).not.toContainText('(U.S.)');await expect(page.locator('td small')).toHaveCount(0);
 const localSlugs=await rows.evaluateAll(ns=>ns.map(n=>n.getAttribute('data-research-slug')));
 for(const slug of ['rotacare-bay-area','roots-community-health','marin-treatment-center'])await expect(page.locator('[data-research-slug="'+slug+'"]')).toHaveCount(1);
 await page.getByRole('link',{name:'Expanded Geography Research',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Expanded Geography Research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 for(const [geography,count] of [['California',5],['U.S.',8],['International',6]] as const)await expect(page.locator('[data-geography="'+geography+'"]')).toHaveCount(count);
 const expandedSlugs=await page.locator('[data-research-slug]').evaluateAll(ns=>ns.map(n=>n.getAttribute('data-research-slug')));
 expect(new Set([...localSlugs,...expandedSlugs]).size).toBe(EXPECTED_PUBLISHED_COUNT);
 for(const slug of ['remedy-alliance','next-distro','sirum','public-health-advocates','california-coalition-for-youth','against-malaria-foundation'])await expect(page.locator('[data-research-slug="'+slug+'"]')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
