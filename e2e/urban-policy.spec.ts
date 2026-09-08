import {test,expect} from '@playwright/test';
for(const [slug,title] of [['housing-action-coalition','Housing Action Coalition'],['spur','SPUR']]){
 test(slug+' conditional model and signed scenarios',async({page})=>{
  await page.goto('/charities/'+slug);
  await expect(page.getByRole('heading',{level:1,name:title,exact:true})).toBeVisible();
  await expect(page.locator('.charity-report-article')).toContainText('No finite positive price');
  await expect(page.locator('.charity-report-funding-status')).toHaveText('Funding route unverified');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const [response]=await Promise.all([page.waitForResponse(r=>r.url().includes('/api/sf-urban-policy-models')),page.getByRole('link',{name:'Inspect the model and sources →'}).click()]);
  const j=await response.json();
  expect(j.hac.evaluated[0].costPerTenQalys).toBe(15000000);
  expect(j.spur.evaluated[0].costPerTenQalys).toBeCloseTo(13661202.18579235);
  expect(j.spur.evaluated.at(-1).status).toBe('harm');
 });
}
