import {test,expect} from '@playwright/test';
for(const [slug,title,price] of [['brightline-defense','Brightline Defense','$3.6M'],['rebuilding-together-sf','Rebuilding Together San Francisco','$5M']]){
 test(`${slug}: inspect modeled price and uncertainty`,async({page})=>{
  await page.goto(`/charities/${slug}`);
  await expect(page.getByRole('heading',{level:1,name:title,exact:true})).toBeVisible();
  await expect(page.locator('.charity-report-article')).toContainText(price);
  await expect(page.locator('.charity-report-article')).toContainText('No finite positive price');
  await expect(page.locator('.charity-report-article')).toContainText('not a core ranking input');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('link',{name:'Inspect the model and sources →'}).click();
  const json=JSON.parse(await page.locator('body').innerText());
  expect(json.brightline.evaluatedCore.find((s:{name:string})=>s.name==='central').costPerTenQalys).toBe(3600000);
 });
}
