import {test,expect} from '@playwright/test';
test('SPUR whole portfolio and canonical-model navigation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/charities/spur');
 await expect(page.getByRole('heading',{level:1,name:'SPUR',exact:true})).toBeVisible();
 const article=page.locator('.report-reading-column article');
 for(const text of ['$10.85M','$2.19M','nonoccupant','No finite positive price'])await expect(article).toContainText(text);
 await expect(article).not.toContainText('Pending final');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const [response]=await Promise.all([page.waitForResponse(r=>r.url().includes('/api/sf-spur-portfolio')),page.getByRole('link',{name:'Inspect the model and sources →'}).click()]);
 const d=await response.json();expect(d.evaluated).toHaveLength(10);
 expect(d.evaluated[0].sfNetQaly).toBeCloseTo(.09214,8);
 expect(d.evaluated[0].bayIncludingSfNetQaly).toBeCloseTo(.4564,8);
 await page.goto('/research');const row=page.locator('[data-research-slug="spur"]');
 await expect(row).toBeVisible();
 expect(Number(await row.getAttribute('data-cost-per-ten-qalys'))).toBeCloseTo(d.evaluated[0].bayUsdPer10Qaly,2);
 expect(errors).toEqual([]);
});
