import {test,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {calculate} from '../lib/oa-portfolio-model.mjs';
import {calculate as current} from '../lib/operation-access-calibrated-model.mjs';
function parity(a:unknown,e:unknown):void {
 // Full numerical parity remains recursive; Node assertions avoid recording
 // thousands of scalar Playwright trace steps for the nested clinical model.
 if(typeof e==='number'){assert.equal(typeof a,'number');if(e!==0)assert.equal(Math.sign(a as number),Math.sign(e));assert(Math.abs((a as number)-e)<=1e-10*Math.max(1,Math.abs(e)));}
 else if(e!==null&&typeof e==='object'){assert.notEqual(a,null);assert.deepEqual(Object.keys(a as object).sort(),Object.keys(e).sort());for(const[k,v]of Object.entries(e))parity((a as Record<string,unknown>)[k],v);}
 else assert.deepEqual(a,e);
}
test('Operation Access whole gift keeps case mix and historical program distinct',async({page,request})=>{
 await page.goto('/charities/operation-access');await expect(page.getByRole('heading',{level:1})).toHaveText('Operation Access');
 await expect(page.locator('article')).toContainText('$57.25M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(3);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://www.operationaccess.org/donate');
 const response=await request.get('/api/oa-portfolio-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.evaluated).toHaveLength(9);
 parity(data.current.evaluated.central,current());
 for(const[i,s]of data.model.scenarios.entries())parity(data.evaluated[i],{id:s.id,...calculate(data.model,s)});
 const historical=await request.get('/api/sf-surgical-access-models');expect(historical.ok()).toBe(true);expect((await historical.json()).oa.evaluated.find((s:{name:string})=>s.name==='central').costPerTenQalys).toBe(600000);
 await page.goto('/san-francisco/all');await expect(page.locator('[data-research-slug="operation-access"]')).toHaveAttribute('data-cost-per-ten-qalys',String(data.current.evaluated.central.regions.bay.price10));
});
