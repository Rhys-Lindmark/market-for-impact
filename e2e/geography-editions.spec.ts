import {test,expect} from '@playwright/test';
import reports from '../data/geography-reports.json' with {type:'json'};
test.beforeEach(async({page,baseURL})=>{
 if(baseURL?.startsWith('http://localhost:'))await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{
  await route.fulfill({response:await route.fetch({url:baseURL+new URL(route.request().url()).pathname})});
 });
});
test('edition hub includes SF alongside eleven new editions',async({page})=>{
 await page.goto('/editions');
 await expect(page.getByRole('heading',{name:'Cities and regions'})).toBeVisible();
 await expect(page.locator('tbody tr')).toHaveCount(12);
 const sf=page.locator('tbody tr').filter({hasText:'San Francisco Bay Area'});
 await expect(sf.getByRole('link',{name:'San Francisco Bay Area',exact:true})).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter');
 await expect(sf.getByRole('link',{name:'All Bay Area research',exact:true})).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter/research');
 await expect(page.getByRole('link',{name:'Denver',exact:true})).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter/cities/denver');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('California and Denver scopes, empty state and expandable counties',async({page})=>{
 for(const route of ['/california/research','/cities/denver']){
  await page.goto(route);
  await expect(page.getByText('Research in progress',{exact:true})).toBeVisible();
  const edition=route.includes('denver')?'denver':'california';
  await expect(page.getByText(`${reports.reports.filter(r=>r.edition===edition).length}/25`,{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'All editions'})).toBeVisible();
  await page.getByText('Which places count?',{exact:true}).click();
  if(route.includes('denver'))await expect(page.getByText('Denver County, Colorado',{exact:true})).toBeVisible();
  else await expect(page.getByText('Benefits to people throughout the state of California.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
});
test('California donor page uses SF presentation with prices and secondary progress',async({page})=>{
 await page.goto('/california');
 await expect(page.getByRole('heading',{name:'Giving in California',exact:true})).toBeVisible();
 await expect(page.locator('.sf-home-principles img')).toHaveCount(3);
 for(const image of await page.locator('.sf-home-principles img').all())expect(await image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBeTruthy();
 await expect(page.getByRole('columnheader',{name:'$ per better life',exact:true})).toBeVisible();
 const progress=page.locator('details').filter({has:page.locator('summary').filter({hasText:'Research progress'})});
 await expect(progress).not.toHaveAttribute('open','');
 await page.getByText('Research progress',{exact:true}).click();
 await expect(page.getByText(/100\/100 candidates screened/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('invalid edition does not become a fabricated geography',async({request})=>{
 expect((await request.get('/cities/not-a-city')).status()).toBe(404);
 expect((await request.get('/not-an-edition')).status()).toBe(404);
});
test('public progress is scoped and every planned edition resolves',async({request})=>{
 const response=await request.get('/api/geography-progress');
 expect(response.ok()).toBeTruthy();
 const data=await response.json();
 expect(data.editions).toHaveLength(11);
 expect(data).not.toHaveProperty('activePackets');
 for(const id of ['california','usa','los-angeles']){
  const edition=data.editions.find((e:{id:string})=>e.id===id);
  expect(edition.discoveryAccepted).toBe(100);
  expect(edition.selectedAlphaIds).toHaveLength(25);
  expect(edition.alphaPublished).toBe(reports.reports.filter(r=>r.edition===id).length);
  expect(edition.betaAcceptedPublished).toBe(0);
 }
 for(const edition of data.editions){
  const path=['california','usa'].includes(edition.id)?'/'+edition.id:'/cities/'+edition.id;
  for(const suffix of ['', '/research'])expect((await request.get(path+suffix)).status()).toBe(200);
 }
});
