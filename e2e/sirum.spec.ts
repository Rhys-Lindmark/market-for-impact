import {test,expect} from '@playwright/test';
import {calculate} from '../lib/sirum-model.mjs';
function parity(a:unknown,e:unknown):void {
 if(typeof e==='number'){expect(typeof a).toBe('number');expect(Math.sign(a as number)).toBe(Math.sign(e));expect(Math.abs((a as number)-e)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(e)));}
 else if(e!==null&&typeof e==='object'){expect(a).not.toBeNull();expect(Object.keys(a as object).sort()).toEqual(Object.keys(e).sort());for(const[k,v]of Object.entries(e))parity((a as Record<string,unknown>)[k],v);}
 else expect(a).toEqual(e);
}
test('SIRUM preserves finite courses, whole gift and unpriced SF benefit',async({page,request})=>{
 await page.goto('/charities/sirum');await expect(page.getByRole('heading',{level:1})).toHaveText('SIRUM');
 await expect(page.locator('article')).toContainText('$130,983');await expect(page.locator('article')).toContainText('residual');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://sirum.org/support-our-work/');
 const response=await request.get('/api/sirum-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.evaluated).toHaveLength(21);
 for(const[i,s]of data.model.scenarios.entries())parity(data.evaluated[i],{id:s.id,...calculate({...data.model.central,...s.overrides})});
 expect(data.evaluated[0].regions.sf.donorPer10Q).toBeNull();
 await page.goto('/archive/expanded-geography-research');const row=page.locator('[data-research-slug="sirum"]');await expect(row).toContainText('(U.S.)');await expect(row).toContainText('$131K');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
