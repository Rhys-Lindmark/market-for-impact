import {expect,test} from '@playwright/test';
test('Diabetes separates model ranking from peer-supported redesign',async({page})=>{
 await page.goto('/charities/st-anthony-foundation');await expect(page.getByRole('heading',{level:1})).toHaveText('St. Anthony Foundation');
 await expect(page.locator('main')).toContainText('$10,666,667');await expect(page.locator('main')).toContainText('not the same outreach program');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const r=await page.request.get('/api/sf-diabetes-model');expect(r.ok()).toBe(true);const d=await r.json();expect(d.verifiedMarginalOffer).toBe(false);expect(d.evaluatedScenarios[1].netQalys).toBe(.000375);
});
