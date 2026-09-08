import {expect,test} from '@playwright/test';
test('Breathe separates cessation and child asthma estimates',async({page})=>{
 await page.goto('/charities/breathe-california');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Breathe California');
 await expect(page.locator('main')).toContainText('$533,333');
 await expect(page.locator('main')).toContainText('$5,983,607');
 await expect(page.locator('main')).toContainText('current SF course');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const r=await page.request.get('/api/sf-breathe-model');expect(r.ok()).toBe(true);
 const d=await r.json();expect(d.verifiedCurrentSfCessationCohort).toBe(false);
 expect(d.evaluatedScenarios[1].netQalys).toBe(.00375);
});
