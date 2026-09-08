import {test,expect} from '@playwright/test';
test('Bay research stays outside SF ranking and exposes full-resource and duration uncertainty',async({page})=>{
 await page.goto('/research');
 await expect(page.locator('[data-research-slug]')).toHaveCount(46);
 await expect(page.locator('[data-us-slug]')).toHaveCount(1);
 await expect(page.locator('[data-international-slug]')).toHaveCount(2);
 const row=page.locator('[data-bay-slug="rotacare-bay-area"]');
 await expect(row).toHaveCount(1);await expect(row).toContainText('$3.4M');
 await expect(page.locator('#top-research')).not.toContainText('RotaCare');
 await row.locator('a').first().click();
 await expect(page.locator('article')).toContainText('$3,395,514');
 await expect(page.locator('article')).toContainText('central_calendar5_only');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const d=await(await page.request.get('/api/rotacare-model')).json();
 expect(d.evaluated).toHaveLength(10);expect(d.evaluated[0].sf.donor_usd_per_10_qaly).toBeNull();
 expect(d.evaluated[0].bay.donor_usd_per_10_qaly).toBeCloseTo(3395513.98448,2);
 await page.goto('/');
 expect(await page.locator('.sf-home-charity').evaluateAll(ns=>ns.map(n=>n.id))).toEqual(['san-francisco-aids-foundation','project-homeless-connect','glide','breathe-california']);
});
