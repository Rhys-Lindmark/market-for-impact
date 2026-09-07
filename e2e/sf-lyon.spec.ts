import{test,expect}from'@playwright/test';
test('Lyon-Martin earlier-care report preserves horizon and signed uncertainty',async({page,request})=>{
 await page.goto('/charities/lyon-martin');await expect(page.getByRole('heading',{name:'Lyon-Martin Community Health Services',exact:true})).toBeVisible();
 await expect(page.locator('body')).toContainText('$4.57M');await expect(page.locator('body')).toContainText('null and harm possible');
 const r=await request.get('/api/sf-lyon-model');expect(r.ok()).toBeTruthy();const m=await r.json();expect(m.evaluatedScenarios[1].costPerTenQalys).toBeCloseTo(4571428.5714,2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
