import {test,expect} from '@playwright/test';
import {calculate,inputsFor,expectedValue} from '../lib/clinic-portfolio-model.mjs';
function parity(a:unknown,e:unknown):void {
 if(typeof e==='number'){expect(typeof a).toBe('number');expect(Math.sign(a as number)).toBe(Math.sign(e));expect(Math.abs((a as number)-e)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(e)));}
 else if(e!==null&&typeof e==='object'){expect(a).not.toBeNull();expect(Object.keys(a as object).sort()).toEqual(Object.keys(e).sort());for(const[k,v]of Object.entries(e))parity((a as Record<string,unknown>)[k],v);}
 else expect(a).toEqual(e);
}
test('Clinic current health/resources and separately historical weighted estimate agree',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 await page.goto('/charities/clinic-by-the-bay');await expect(page.getByRole('heading',{level:1})).toHaveText('Clinic by the Bay');
 for(const s of ['$17.49M','$24.99M','82.6%','−0.0010305'])await expect(page.locator('article')).toContainText(s);
 await expect(page.locator('.report-research-effort summary')).toContainText('14 min on GPT-6.1 Sol');
 await expect(page.locator('.report-heading')).not.toContainText('V2');
 await expect(page.locator('#summary > ul').first().locator('li')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://www.clinicbythebay.org/donate');
 const response=await request.get('/api/clinic-portfolio-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.scenarios).toHaveLength(39);expect(data.historical.evaluated).toHaveLength(34);parity(data.historical.expected,expectedValue(data.historical.model));
 expect(data.rankingCentral.donorBayPrice10).toBeCloseTo(17490721.53021219,5);expect(data.evaluated.resourcesBay).toBeLessThan(0);expect(data.fundingRoom).toBeNull();
 for(const[i,s]of data.historical.model.scenarios.entries())parity(data.historical.evaluated[i],{id:s.id,...calculate(inputsFor(data.historical.model,s))});
 await page.goto('/san-francisco/all');await expect(page.locator('[data-research-slug="clinic-by-the-bay"]')).toHaveAttribute('data-cost-per-ten-qalys',String(data.rankingCentral.donorBayPrice10));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
