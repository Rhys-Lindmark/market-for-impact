import {test,expect} from '@playwright/test';
import {calculate} from '../lib/next-distro-model.mjs';
function parity(a:unknown,e:unknown):void {
 if(typeof e==='number'){expect(typeof a).toBe('number');expect(Math.sign(a as number)).toBe(Math.sign(e));expect(Math.abs((a as number)-e)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(e)));}
 else if(e!==null&&typeof e==='object'){expect(a).not.toBeNull();expect(Object.keys(a as object).sort()).toEqual(Object.keys(e).sort());for(const[k,v]of Object.entries(e))parity((a as Record<string,unknown>)[k],v);}
 else expect(a).toEqual(e);
}
test('NEXT whole gift retains zero SF eligibility and signed scenarios',async({page,request})=>{
 await page.goto('/charities/next-distro');await expect(page.getByRole('heading',{level:1})).toHaveText('NEXT Distro (NEXT Harm Reduction Inc.)');
 await expect(page.locator('article')).toContainText('$172,973');
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://nextdistro.org/donate');
 const response=await request.get('/api/next-distro-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.evaluated).toHaveLength(18);
 for(const[i,[id,overrides]]of Object.entries(data.model.scenarios).entries()){
  parity(data.evaluated[i],{id,...calculate({...data.model.central,...overrides as object})});
  expect(data.evaluated[i].q.sf).toBe(0);
  expect(data.evaluated[i].prices.sf).toEqual({donor:null,gross:null,net:null});
 }
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug="next-distro"]')).toContainText('(U.S.)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
