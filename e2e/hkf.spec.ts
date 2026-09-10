import {test,expect} from '@playwright/test';
import {calculate,inputsFor} from '../lib/hkf-model.mjs';
function parity(a:unknown,b:unknown){
 if(typeof b==='number'){expect(typeof a).toBe('number');expect(Math.abs((a as number)-b)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(b)));}
 else if(b!==null&&typeof b==='object'){expect(a).not.toBeNull();expect(Object.keys(a as object).sort()).toEqual(Object.keys(b).sort());for(const[k,v]of Object.entries(b))parity((a as Record<string,unknown>)[k],v);}
 else expect(a).toEqual(b);
}
test('HKF expanded whole gift retains20 signed scenarios and Bay geography',async({page,request})=>{
 await page.goto('/charities/healthier-kids-foundation');await expect(page.getByRole('heading',{level:1})).toHaveText('Healthier Kids Foundation');
 await expect(page.locator('article')).toContainText('$3,763,882');await expect(page.locator('article')).toContainText('screening');
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://hkidsf.org/donate/');
 const response=await request.get('/api/hkf-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.evaluated).toHaveLength(20);
 for(const [i,s]of data.model.scenarios.entries())parity(data.evaluated[i],{id:s.id,...calculate(inputsFor(data.model,s))});
 expect(data.evaluated[0].donor_sf_per_10q).toBeNull();
 await page.goto('/research');await expect(page.locator('[data-research-slug="healthier-kids-foundation"]')).not.toContainText('(Bay Area)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
