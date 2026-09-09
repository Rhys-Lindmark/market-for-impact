import {test,expect} from '@playwright/test';
test('HPP retains full gift and finite maternal treatment effect',async({page,request})=>{
 await page.goto('/charities/homeless-prenatal-program');
 await expect(page.getByRole('heading',{level:1,name:'Homeless Prenatal Program',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$27.61 million');
 const donate=page.getByRole('link',{name:'Donate',exact:true});await expect(donate).toHaveCount(2);
 for(const link of await donate.all())await expect(link).toHaveAttribute('href','https://www.homelessprenatal.org/donate');
 expect(await page.locator('article table').count()).toBe(0);
 const response=await request.get('/api/hpp-model');expect(response.ok()).toBeTruthy();const data=await response.json();
 expect(data.evaluated).toHaveLength(12);expect(data.evaluated[0].sf.donor_per_10q).toBeGreaterThan(27.60e6);expect(data.evaluated[0].sf.donor_per_10q).toBeLessThan(27.63e6);
 expect(data.evaluated.some((x:{sf:{qaly:number;donor_per_10q:number|null}})=>x.sf.qaly<0&&x.sf.donor_per_10q===null)).toBeTruthy();
 await page.goto('/research');await expect(page.locator('[data-research-slug="homeless-prenatal-program"]')).toContainText('Homeless Prenatal Program');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
