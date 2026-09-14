import {test,expect} from '@playwright/test';
import reports from '../data/geography-reports.json' with {type:'json'};
import progress from '../docs/geography-progress.json' with {type:'json'};

const canonical='https://ai.rhyslindmark.com/givebetter';
test.beforeEach(async({page,request,baseURL})=>{
 if(!baseURL || !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(baseURL))return;
 // Canonical document links and absolute assets must exercise this checkout, not production.
 for(const pattern of [canonical+'/**','https://market-for-impact.rhyslindmark.chatgpt.site/_next/**']){
  await page.route(pattern,async route=>{
   const u=new URL(route.request().url());
   await route.fulfill({response:await request.get(new URL(u.pathname.replace(/^\/givebetter/,'')+u.search,baseURL).href,{maxRedirects:0})});
  });
 }
});
test('edition directory includes SF alongside eleven editions',async({page})=>{
 await page.goto('/all');
 await expect(page.getByRole('heading',{name:'Cities and regions'})).toBeVisible();
 await expect(page.locator('tbody tr')).toHaveCount(12);
 const sf=page.locator('tbody tr').filter({hasText:'San Francisco Bay Area'});
 await expect(sf.getByRole('link',{name:'San Francisco Bay Area',exact:true})).toHaveAttribute('href',canonical+'/san-francisco');
 await expect(sf.getByRole('link',{name:'All Bay Area research',exact:true})).toHaveAttribute('href',canonical+'/san-francisco/all');
 for(const e of progress.editions)await expect(page.getByRole('link',{name:e.label,exact:true})).toHaveAttribute('href',canonical+'/'+e.id);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
for(const e of progress.editions){
 test(e.id+' separates its unselected shortlist from its full research list',async({page})=>{
  await page.goto('/'+e.id);
  await expect(page.getByRole('heading',{level:1})).toContainText(e.label);
  await expect(page.locator('.sf-home-principles img')).toHaveCount(3);
  await expect(page.locator('[data-research-table], tbody tr, .sf-home-charity')).toHaveCount(0);
  await expect(page.getByText(/shortlist.*(research|review)|research.*shortlist/i).first()).toBeVisible();
  const all=page.locator('a[href="'+canonical+'/'+e.id+'/all"]').first();
  await expect(all).toBeVisible();
  await all.click();
  await expect(page).toHaveURL(new RegExp('/'+e.id+'/all$'));
  await expect(page).toHaveTitle(new RegExp('GiveBetter x '+e.label+' Research'));
  const table=page.locator('[data-research-table]');
  const count=reports.reports.filter(r=>r.edition===e.id).length;
  if(count){
   await expect(table).toHaveCount(1);
   await expect(table.locator('tbody tr')).toHaveCount(count);
   await expect(table.getByRole('columnheader',{name:'$ per better life',exact:true})).toBeVisible();
   await expect(table.getByRole('columnheader',{name:/Avg\. annual expenses/})).toBeVisible();
   await expect(table.locator('details, [data-expense-details], [class*="readiness"]')).toHaveCount(0);
  }else await expect(page.locator('tbody tr')).toHaveCount(0);
  await expect(page.locator('[data-expense-details]')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 });
}
test('California and Denver expose precise benefit boundaries on full lists',async({page})=>{
 for(const id of ['california','denver']){
  await page.goto('/'+id+'/all');
  await page.getByText('Which places count?',{exact:true}).click();
  await expect(page.getByText(id==='denver'?'Denver County, Colorado':'Benefits to people throughout the state of California.',{exact:true})).toBeVisible();
 }
});
test('SF and edition full lists share styling and average-only expenses',async({page})=>{
 await page.goto('/san-francisco/all');
 const sf=page.locator('[data-research-table]');
 await expect(sf).toHaveCount(1);
 const classes=await sf.getAttribute('class');
 await expect(sf.locator('details, [data-expense-details], [class*="readiness"]')).toHaveCount(0);
 await page.goto('/california/all');
 await expect(page.locator('[data-research-table]')).toHaveAttribute('class',classes!);
});
test('invalid edition does not become a fabricated geography',async({request})=>{
 for(const path of ['/cities/not-a-city','/not-an-edition','/not-an-edition/all'])expect((await request.get(path,{maxRedirects:0})).status()).toBe(404);
});
test('public progress stays scoped and all eleven direct route pairs resolve',async({request})=>{
 const response=await request.get('/api/geography-progress');
 expect(response.ok()).toBeTruthy();
 const data=await response.json();
 expect(data.editions).toHaveLength(11);
 expect(data).not.toHaveProperty('activePackets');
 for(const id of ['california','usa','los-angeles']){
  const e=data.editions.find((row:{id:string})=>row.id===id);
  expect(e.discoveryAccepted).toBe(100);
  expect(e.selectedAlphaIds).toHaveLength(25);
  expect(e.alphaPublished).toBe(reports.reports.filter(r=>r.edition===id).length);
  expect(e.betaAcceptedPublished).toBe(0);
 }
 for(const e of data.editions)for(const suffix of ['', '/all'])expect((await request.get('/'+e.id+suffix,{maxRedirects:0})).status()).toBe(200);
});
