import {test,expect} from '@playwright/test';
test('Code Tenderloin keeps whole-gift and finite-survival boundaries',async({page,request})=>{
 await page.goto('/charities/code-tenderloin');
 await expect(page.getByRole('heading',{name:'Code Tenderloin',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$1.97 million');
 await expect(page.getByRole('link',{name:'Donate',exact:true})).toHaveAttribute('href','https://www.codetenderloin.org/donate');
 expect(await page.locator('article table').count()).toBe(0);
 await expect(page.locator('article')).toContainText('75% other work');
 const response=await request.get('/api/code-tenderloin-model');expect(response.ok()).toBeTruthy();
 const data=await response.json();expect(data.evaluated).toHaveLength(15);
 expect(data.evaluated[0].donor_sf_per_10q).toBeGreaterThan(1.96e6);
 expect(data.evaluated[0].donor_sf_per_10q).toBeLessThan(1.98e6);
 expect(data.evaluated[0].schedule).toHaveLength(10);
 expect(data.evaluated.some((x:{sf_q:number;donor_sf_per_10q:number|null})=>x.sf_q<0&&x.donor_sf_per_10q===null)).toBeTruthy();
 await page.goto('/research');await expect(page.locator('[data-research-slug="code-tenderloin"]')).toContainText('Code Tenderloin');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
