import {test,expect} from '@playwright/test';
import {calculate} from '../lib/via-heart-model.mjs';
function parity(a:unknown,e:unknown):void {
 if(typeof e==='number'){expect(typeof a).toBe('number');expect(Math.sign(a as number)).toBe(Math.sign(e));expect(Math.abs((a as number)-e)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(e)));}
 else if(e!==null&&typeof e==='object'){expect(a).not.toBeNull();expect(Object.keys(a as object).sort()).toEqual(Object.keys(e).sort());for(const[k,v]of Object.entries(e))parity((a as Record<string,unknown>)[k],v);}
 else expect(a).toEqual(e);
}
test('Via Heart whole gift retains funded duration and signed scenarios',async({page,request})=>{
 await page.goto('/charities/via-heart-project');await expect(page.getByRole('heading',{level:1})).toHaveText('Via Heart Project');
 await expect(page.locator('article')).toContainText('$73.86M');
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://viaheartproject.org/donate/');
 const response=await request.get('/api/via-heart-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.evaluated).toHaveLength(20);
 for(const[i,[id,overrides]]of Object.entries(data.model.scenarios).entries()){
  parity(data.evaluated[i],{id,...calculate({...data.model.central,...overrides as object})});
  if(data.evaluated[i].q.sf<=0)expect(data.evaluated[i].prices.sf).toEqual({donor:null,gross:null,net:null});
 }
 await page.goto('/research');await expect(page.locator('[data-research-slug="via-heart-project"]')).toContainText('(Bay Area)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
