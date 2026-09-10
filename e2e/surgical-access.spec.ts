import {test,expect} from '@playwright/test';
for(const [slug,title] of [['pacific-vision-foundation','Pacific Vision Foundation']]){
 test(`${slug}: conditional price, signed nulls and inspectable model`,async({page})=>{
  await page.goto(`/charities/${slug}`);
  await expect(page.getByRole('heading',{level:1,name:title,exact:true})).toBeVisible();
  await expect(page.locator('.report-reading-column article')).toContainText('No finite positive price');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const [response]=await Promise.all([page.waitForResponse(r=>r.url().includes('/api/sf-surgical-access-models')),page.getByRole('link',{name:'Inspect the model and sources →'}).click()]);
  const json=await response.json();
  expect(json.oa.evaluated.find((s:{name:string})=>s.name==='central').costPerTenQalys).toBe(600000);
  expect(json.pvf.evaluatedCore.find((s:{name:string})=>s.name==='central').costPerTenQalys).toBeCloseTo(714285.7142857143);
 });
}
