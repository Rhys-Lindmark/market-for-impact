import {test,expect} from '@playwright/test';
test('Self-Help current report/API/shortlist/finances agree responsively',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/san-francisco/all');
 const top=await page.locator('[data-research-slug]').evaluateAll(rows=>rows.slice(0,4).map(row=>row.getAttribute('data-research-slug')));
 const row=page.locator('[data-research-slug="self-help-for-the-elderly"]');await expect(row).toContainText('$643K');
 await row.locator('a').first().click();await expect(page.getByRole('heading',{level:1})).toHaveText('Self-Help for the Elderly');
 await expect(page.locator('#research-summary')).toContainText('prospective trial-matched course');
 await expect(page.locator('article')).toContainText('$2.4M');await expect(page.locator('article')).toContainText('$600K');
 await expect(page.locator('nav.report-contents [data-toc-primary]')).toHaveCount(7);
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
 await expect(page.locator('[data-expense-appendix]')).toHaveAttribute('data-average-expenses',String(32376728.333333332));
 const d=await(await page.request.get('/api/sf-selfhelp-model')).json();expect(d.cases).toHaveLength(19);expect(d.reference.result.sf.usdPerBetterLife).toBeCloseTo(643436.4146344183,6);expect(d.reference.result.sf.incomeEquivalentYears).toBeLessThan(0);expect(d.ordinaryDonation.expectedValue).toBeNull();expect(d.historical.evaluated).toHaveLength(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/san-francisco');expect(await page.locator('.sf-home-charity').evaluateAll(rows=>rows.map(row=>row.id))).toEqual(top);
 await expect(page.locator('#self-help-for-the-elderly')).toContainText('$643K');await expect(page.locator('#self-help-for-the-elderly')).toContainText('ordinary-donation expected value unknown');
 const img=page.locator('#self-help-for-the-elderly img');await expect(img).toBeVisible();await img.evaluate(async image=>{if(!(image as HTMLImageElement).complete)await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('image failed'));});});expect(await img.evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
