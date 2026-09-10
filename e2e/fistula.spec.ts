import {test,expect} from '@playwright/test';
import {calculate} from '../lib/fistula-model.mjs';
test('Fistula report retains global cost, full resources and unknown local price',async({page,request})=>{
 await page.goto('/charities/fistula-foundation');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Fistula Foundation');
 await expect(page.locator('article')).toContainText('$76,286');await expect(page.locator('article')).toContainText('$101,944');
 const donate=page.getByRole('link',{name:'Donate',exact:true});await expect(donate).toHaveCount(2);
 for(const link of await donate.all())await expect(link).toHaveAttribute('href','https://fistulafoundation.org/how-to-help/');
 const response=await request.get('/api/fistula-model');expect(response.ok()).toBe(true);const data=await response.json();
 expect(data.evaluated).toHaveLength(15);
 for(const [i,s] of data.model.scenarios.entries()){
  const expected={id:s.id,...calculate({...data.model.central_inputs,...s.overrides})};
  expect(Object.keys(data.evaluated[i]).sort()).toEqual(Object.keys(expected).sort());
  for(const [k,value] of Object.entries(expected)){
   if(typeof value==='number')expect(Math.abs(data.evaluated[i][k]-value)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(value)));
   else expect(data.evaluated[i][k]).toEqual(value);
  }
 }
 expect(data.evaluated[0].donor_per_10q).toBeCloseTo(76285.65,1);expect(data.evaluated[0].sf_direct_per_10q).toBeNull();
 await page.goto('/archive/international-research');const row=page.locator('[data-research-slug="fistula-foundation"]');await expect(row).toContainText('Fistula Foundation');await expect(row).toContainText('$76K');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
