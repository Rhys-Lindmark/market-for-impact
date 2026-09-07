import {test,expect} from '@playwright/test';
test('Huckleberry direct-QALY research preserves funding and duration boundaries',async({page,request})=>{
 await page.goto('/charities/huckleberry-youth-programs');
 await expect(page.getByRole('heading',{name:'Huckleberry Youth Programs',exact:true})).toBeVisible();
 await expect(page.locator('body')).toContainText('$3.69M');
 await expect(page.locator('body')).toContainText('Do not multiply by follow-up duration or completion again');
 const r=await request.get('/api/sf-huckleberry-model');expect(r.ok()).toBeTruthy();
 const m=await r.json();expect(m.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(3692307.6923,2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.goto('/research#research-funnel');
 for(const slug of ['huckleberry-youth-programs','harm-reduction-therapy-center','homeless-youth-alliance','jcyc']) {
  await expect(page.locator('.sf-deep-queue a[href$="/charities/'+slug+'"]')).toBeVisible();
 }
});
