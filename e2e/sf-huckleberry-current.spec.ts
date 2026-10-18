import {test,expect} from '@playwright/test';
test('Huckleberry signed conditional report, API, list and expenses agree responsively',async({page})=>{
 test.setTimeout(60000);await page.goto('/san-francisco/all');
 const row=page.locator('[data-research-slug="huckleberry-youth-programs"]');await expect(row).toContainText('$4.2M');
 const top=await page.locator('[data-research-slug]').evaluateAll(rows=>rows.slice(0,4).map(row=>row.getAttribute('data-research-slug')));
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1})).toHaveText('Huckleberry Youth Programs');
 await expect(page.locator('#research-summary')).toContainText('$4.22M');await expect(page.locator('article')).toContainText('$3.69M');
 await expect(page.locator('.report-research-effort summary')).toContainText('14 min on GPT-6.1 Sol');
 await expect(page.locator('nav.report-contents [data-toc-primary]')).toHaveCount(7);
 await expect(page.locator('[data-expense-appendix]')).toHaveAttribute('data-average-expenses','8677745');
 const d=await(await page.request.get('/api/sf-huckleberry-model')).json();expect(d.cases).toHaveLength(20);expect(d.historical.evaluated).toHaveLength(3);
 expect(d.reference.result.sf.usdPerBetterLife).toBeCloseTo(4217525.644280174,6);expect(d.reference.result.bay.incomeEquivalentYears).toBeLessThan(0);expect(d.ordinaryDonation.expectedValue).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/san-francisco');expect(await page.locator('.sf-home-charity').evaluateAll(rows=>rows.map(row=>row.id))).toEqual(top);
});
