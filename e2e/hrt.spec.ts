import {test,expect} from '@playwright/test';
import {calculate,inputsFor} from '../lib/hrt-model.mjs';
test('HRT whole gift and24 signed API cases preserve supply-chain boundaries',async({page,request})=>{
 await page.goto('/charities/harm-reduction-therapeutics');await expect(page.getByRole('heading',{level:1})).toHaveText('Harm Reduction Therapeutics');
 await expect(page.locator('article')).toContainText('$255,604');await expect(page.locator('article')).toContainText('Remedy');
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);for(const link of await links.all())await expect(link).toHaveAttribute('href','https://www.harmreductiontherapeutics.org/about/');
 const response=await request.get('/api/hrt-model');expect(response.ok()).toBe(true);const data=await response.json();expect(data.evaluated).toHaveLength(24);
 for(const[i,s]of data.model.scenarios.entries()){
  const expected={id:s.id,...calculate(inputsFor(data.model,s))};expect(Object.keys(data.evaluated[i]).sort()).toEqual(Object.keys(expected).sort());
  for(const[k,v]of Object.entries(expected)){if(typeof v==='number')expect(Math.abs(data.evaluated[i][k]-v)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(v)));else expect(data.evaluated[i][k]).toEqual(v);}
 }
 expect(data.evaluated[0].donor_sf_per_10q).toBeGreaterThan(120e6);
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug="harm-reduction-therapeutics"]')).toContainText('(U.S.)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
