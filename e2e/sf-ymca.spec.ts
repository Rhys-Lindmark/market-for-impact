import {expect,test} from '@playwright/test';
test('YMCA report leads with the central price and exposes inspectable model',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/charities/ymca-greater-sf');
 await expect(page.getByRole('heading',{level:1})).toHaveText('YMCA of Greater San Francisco');
 await expect(page.locator('main')).toContainText('$9.50 million');
 await expect(page.locator('main')).toContainText('entire gift');
 await expect(page.locator('main')).toContainText('30%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const link=page.getByRole('link',{name:'Inspect the whole-gift model',exact:true});
 await expect(link).toHaveAttribute('href','/api/ymca-portfolio-model');
 const response=await page.request.get('/api/sf-ymca-model');expect(response.ok()).toBe(true);
 const data=await response.json();expect(data.verifiedMarginalOffer).toBe(false);
 expect(data.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(2095451.938066746,4);
 expect(data.evaluatedScenarios[0].costPerTenQalys).toBeLessThan(100000);
 expect(errors).toEqual([]);
});
