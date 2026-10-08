import {test,expect} from '@playwright/test';
test.beforeEach(async({page,baseURL})=>{
 if(baseURL?.startsWith('http://localhost:'))await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{
  await route.fulfill({response:await route.fetch({url:baseURL+new URL(route.request().url()).pathname})});
 });
});
for(const [slug,name,price]of [['coalition-for-clean-air','Coalition for Clean Air',10031384.432836773],['garment-worker-center','Garment Worker Center',23356937.778449338]]as const){
 test(name+' has a usable scoped model and honest time header',async({page,request},info)=>{
  const route='/los-angeles/charities/'+slug;
  await page.goto(route);
  await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
  await expect(page.locator('.report-research-effort summary')).not.toContainText('unrecorded');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter'+route);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const response=await request.get('/api/geography-reports/los-angeles/'+slug);expect(response.ok()).toBeTruthy();
  const data=await response.json();
  expect(data.edition).toBe('los-angeles');expect(JSON.stringify(data)).not.toMatch(/\/tmp\/|\/Users\//);
  const central=data.model.scenarios.find((s:{id:string})=>s.id==='central');
  expect(central.costPer10Qalys).toBeCloseTo(price,4);
  if(slug==='garment-worker-center')await page.screenshot({path:'/private/tmp/la-gwc-'+info.project.name+'.png',fullPage:false});
 });
}
test('LA list uses current estimates and keeps expense details off the overview',async({page})=>{
 await page.goto('/los-angeles/all');
 await expect(page.locator('tr').filter({hasText:'Coalition for Clean Air'})).toContainText('$10.0M');
 await expect(page.locator('tr').filter({hasText:'Garment Worker Center'})).toContainText('$23.4M');
 await expect(page.locator('[data-expense-details]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
