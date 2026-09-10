import {test,expect} from '@playwright/test';
test('CCA statewide portfolio preserves local denominator and resource displacement',async({page,request})=>{
 await page.goto('/charities/coalition-for-clean-air');
 await expect(page.getByRole('heading',{level:1,name:'Coalition for Clean Air',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$124 billion SF');
 const donate=page.getByRole('link',{name:'Donate',exact:true});await expect(donate).toHaveCount(2);
 for(const link of await donate.all())await expect(link).toHaveAttribute('href','https://ccair.app.neoncrm.com/forms/donate');
 expect(await page.locator('article table').count()).toBe(0);
 const response=await request.get('/api/cca-model');expect(response.ok()).toBeTruthy();const data=await response.json();
 expect(data.evaluated).toHaveLength(11);const central=data.evaluated[0];
 expect(central.sf.donor_usd_per_10_qaly).toBeGreaterThan(120e9);expect(central.sf.donor_usd_per_10_qaly).toBeLessThan(130e9);
 expect(central.total_net_resource_usd).toBe(110000);
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug="coalition-for-clean-air"]')).toContainText('(California)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
