import {test,expect} from '@playwright/test';
test('SFPHF preserves finite cure and whole-gift boundaries',async({page,request})=>{
 await page.goto('/charities/sf-public-health-foundation');
 await expect(page.getByRole('heading',{name:'San Francisco Public Health Foundation',level:1,exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$18.31 million');
 const donate=page.getByRole('link',{name:'Donate',exact:true});await expect(donate).toHaveCount(2);
 for(const link of await donate.all())await expect(link).toHaveAttribute('href','https://sfphf.allyrafundraising.com/');
 await expect(page.locator('article')).toContainText('90% other foundation work');
 expect(await page.locator('article table').count()).toBe(0);
 const response=await request.get('/api/sfphf-model');expect(response.ok()).toBeTruthy();
 const data=await response.json();expect(data.evaluated).toHaveLength(10);
 expect(data.evaluated[0].sf.donor_per_10q).toBeGreaterThan(18.30e6);expect(data.evaluated[0].sf.donor_per_10q).toBeLessThan(18.32e6);
 expect(data.evaluated.some((x:{sf:{qaly:number;donor_per_10q:number|null}})=>x.sf.qaly<=0&&x.sf.donor_per_10q===null)).toBeTruthy();
 await page.goto('/research');await expect(page.locator('[data-research-slug="sf-public-health-foundation"]')).toContainText('San Francisco Public Health Foundation');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
