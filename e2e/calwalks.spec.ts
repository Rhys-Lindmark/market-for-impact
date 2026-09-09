import {test,expect} from '@playwright/test';
import {calculate} from '../lib/calwalks-model.mjs';
test('California Walks whole-gift report preserves local and resource boundaries',async({page,request})=>{
 await page.goto('/charities/california-walks');
 await expect(page.getByRole('heading',{level:1})).toHaveText('California Walks');
 await expect(page.locator('article')).toContainText('$632M SF');
 const donate=page.getByRole('link',{name:'Donate',exact:true});await expect(donate).toHaveCount(2);
 for(const link of await donate.all())await expect(link).toHaveAttribute('href','https://calwalks.org/donate');
 const response=await request.get('/api/calwalks-model');expect(response.ok()).toBe(true);const data=await response.json();
 expect(data.evaluated).toHaveLength(14);
 expect(data.evaluated).toEqual(data.model.scenarios.map((s:{id:string;inputs:Parameters<typeof calculate>[0]})=>({id:s.id,...calculate(s.inputs)})));
 expect(data.evaluated[0].sf.donor_usd_per_10_qaly).toBeGreaterThan(600e6);
 await page.goto('/research');await expect(page.locator('[data-research-slug="california-walks"]')).toContainText('(California)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
