import {test,expect} from '@playwright/test';
import {calculate as sfaf} from '../lib/sfaf-portfolio-model.mjs';
import {calculate as phc,inputsFor} from '../lib/phc-portfolio-model.mjs';
for(const [key,slug,count] of [['sfaf','san-francisco-aids-foundation',16],['phc','project-homeless-connect',15]] as const){
test(key+' whole-gift API and report match every signed scenario',async({page,request})=>{
 await page.goto('/charities/'+slug);
 const link=page.getByRole('link',{name:'Inspect formulas, inputs and sources'});
 await expect(link).toHaveAttribute('href','/api/'+key+'-portfolio-model');
 const response=await request.get('/api/'+key+'-portfolio-model');expect(response.ok()).toBe(true);
 const data=await response.json();expect(data.evaluated).toHaveLength(count);
 const expected=data.model.scenarios.map((s:{id:string;inputs:Parameters<typeof sfaf>[0]})=>({id:s.id,...(key==='sfaf'?sfaf(s.inputs):phc(inputsFor(data.model,s)))}));
 expect(data.evaluated).toEqual(expected);
 expect(expected.some((s:ReturnType<typeof sfaf>&ReturnType<typeof phc>)=>key==='sfaf'?s.sf.qaly<0:s.sf_q<0)).toBe(true);
 expect(expected.some((s:ReturnType<typeof sfaf>&ReturnType<typeof phc>)=>key==='sfaf'?s.sf.donor_per_10q===null:s.donor_sf_per_10q===null)).toBe(true);
 await expect(page.getByRole('link',{name:'Donate',exact:true})).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
}
test('new shortlist has explicit whole-gift boundaries',async({page})=>{
 await page.goto('/');await expect(page.locator('.sf-home-research-note')).toHaveCount(2);
 await expect(page.locator('#pacific-vision-foundation')).toContainText('unrestricted');
 await expect(page.locator('#recares')).toContainText('Whole-organization research');
});
