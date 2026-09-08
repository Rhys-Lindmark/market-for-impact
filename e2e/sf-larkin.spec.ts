import {test,expect} from '@playwright/test';
test('Larkin cash model exposes assumptions and threshold without overflow',async({page,request})=>{
 await page.goto('/charities/larkin-street');
 await expect(page.getByRole('heading',{name:'Larkin Street Youth Services',exact:true})).toBeVisible();
 await expect(page.locator('body')).toContainText('$40.4M');
 await expect(page.locator('body')).toContainText('$162,000');
 await expect(page.locator('body')).toContainText('not a universal limit on cash benefits');
 const r=await request.get('/api/sf-larkin-model');expect(r.ok()).toBeTruthy();
 const m=await r.json();expect(m.evaluatedScenarios[1].costPerTenQalys).toBe(40400000);
 expect(m.fundingRoom.verifiedUsd).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.goto('/research');
 await expect(page.locator('[data-research-slug] a[href$="/charities/larkin-street"]').first()).toBeVisible();
});
