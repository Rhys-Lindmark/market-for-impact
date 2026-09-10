import {test,expect} from '@playwright/test';
import {calculate} from '../lib/calwalks-model.mjs';
function numericParity(actual: unknown, expected: unknown): void {
 if(typeof expected==='number') {
  expect(typeof actual).toBe('number');
  expect(Math.sign(actual as number)).toBe(Math.sign(expected));
  expect(Math.abs((actual as number)-expected)).toBeLessThanOrEqual(Math.max(1,Math.abs(expected))*1e-10);
 } else if(Array.isArray(expected)) {
  expect(Array.isArray(actual)).toBe(true);expect((actual as unknown[]).length).toBe(expected.length);
  expected.forEach((value,index)=>numericParity((actual as unknown[])[index],value));
 } else if(expected!==null&&typeof expected==='object') {
  expect(actual).not.toBeNull();expect(typeof actual).toBe('object');
  expect(Object.keys(actual as object).sort()).toEqual(Object.keys(expected).sort());
  for(const [key,value] of Object.entries(expected))numericParity((actual as Record<string,unknown>)[key],value);
 } else expect(actual).toEqual(expected);
}
test('California Walks whole-gift report preserves local and resource boundaries',async({page,request})=>{
 await page.goto('/charities/california-walks');
 await expect(page.getByRole('heading',{level:1})).toHaveText('California Walks');
 await expect(page.locator('article')).toContainText('$632M SF');
 const donate=page.getByRole('link',{name:'Donate',exact:true});await expect(donate).toHaveCount(2);
 for(const link of await donate.all())await expect(link).toHaveAttribute('href','https://calwalks.org/donate');
 const response=await request.get('/api/calwalks-model');expect(response.ok()).toBe(true);const data=await response.json();
 expect(data.evaluated).toHaveLength(14);
 numericParity(data.evaluated,data.model.scenarios.map((s:{id:string;inputs:Parameters<typeof calculate>[0]})=>({id:s.id,...calculate(s.inputs)})));
 expect(data.evaluated[0].sf.donor_usd_per_10_qaly).toBeGreaterThan(600e6);
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug="california-walks"]')).toContainText('(California)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
