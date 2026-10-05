import {test,expect} from '@playwright/test';
test.beforeEach(async({page,baseURL})=>{
 if(baseURL?.startsWith('http://localhost:'))await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{
  await route.fulfill({response:await route.fetch({url:baseURL+new URL(route.request().url()).pathname})});
 });
});
for(const [slug,name,price]of [['climate-resolve','Climate Resolve',22867008.06294294],['vietnamese-american-cancer-foundation','Vital Access Care Foundation (Vietnamese American Cancer Foundation)',20598207.780573618]]as const){
 test(name+' displays current estimate and per-model timing',async({page,request},info)=>{
  const route='/los-angeles/charities/'+slug;await page.goto(route);
  await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
  await expect(page.locator('.report-research-effort summary')).not.toContainText('unrecorded');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter'+route);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const response=await request.get('/api/geography-reports/los-angeles/'+slug);expect(response.ok()).toBeTruthy();
  const data=await response.json();expect(JSON.stringify(data)).not.toMatch(/\/tmp\/|\/Users\//);
  expect(data.model.scenarios.find((s:{id:string})=>s.id==='central').costPer10Qalys).toBeCloseTo(price,4);
  if(slug==='vietnamese-american-cancer-foundation')await page.screenshot({path:'/private/tmp/la-vacf-'+info.project.name+'.png',fullPage:false});
 });
}
test('LA list matches both new deep estimates',async({page})=>{
 await page.goto('/los-angeles/all');
 await expect(page.locator('tr').filter({hasText:'Climate Resolve'})).toContainText('$22.9M');
 await expect(page.locator('tr').filter({hasText:'Vital Access Care Foundation'})).toContainText('$20.6M');
 await expect(page.locator('[data-expense-details]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
