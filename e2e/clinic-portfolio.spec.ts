import {test,expect} from '@playwright/test';
import {calculate,inputsFor,expectedValue} from '../lib/clinic-portfolio-model.mjs';
function parity(a:unknown,e:unknown):void {
 if(typeof e==='number'){expect(typeof a).toBe('number');expect(Math.sign(a as number)).toBe(Math.sign(e));expect(Math.abs((a as number)-e)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(e)));}
 else if(e!==null&&typeof e==='object'){expect(a).not.toBeNull();expect(Object.keys(a as object).sort()).toEqual(Object.keys(e).sort());for(const[k,v]of Object.entries(e))parity((a as Record<string,unknown>)[k],v);}
 else expect(a).toEqual(e);
}
test('Clinic whole gift publishes named care and explicit weighted estimate',async({page,request})=>{
 await page.goto('/charities/clinic-by-the-bay');await expect(page.getByRole('heading',{level:1})).toHaveText('Clinic by the Bay');
 for(const s of ['$2,860,825','$11,395,651','82.6%'])await expect(page.locator('article')).toContainText(s);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://www.clinicbythebay.org/donate');
 const response=await request.get('/api/clinic-portfolio-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.evaluated).toHaveLength(34);parity(data.expected,expectedValue(data.model));
 for(const[i,s]of data.model.scenarios.entries())parity(data.evaluated[i],{id:s.id,...calculate(inputsFor(data.model,s))});
 await page.goto('/research');await expect(page.locator('[data-research-slug="clinic-by-the-bay"]')).toHaveAttribute('data-cost-per-ten-qalys',String(data.expected.donor_bay_per_10q));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
