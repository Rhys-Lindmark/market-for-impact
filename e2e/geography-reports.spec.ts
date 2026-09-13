import {test,expect} from '@playwright/test';

// Production assets use the existing Sites origin. During local pre-deployment
// checks, serve those exact asset paths from this build, not the previous release.
test.beforeEach(async({page,baseURL})=>{
 if(baseURL?.startsWith('http://localhost:'))await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  await route.fulfill({response:await route.fetch({url:baseURL+path})});
 });
});

test('published research has measured headers, usable models and scoped canonical links',async({page,request})=>{
 for(const [edition,slug,name,minutes] of [
  ['california','harm-reduction-services','Harm Reduction Services','19'],
  ['usa','national-center-for-healthy-housing','National Center for Healthy Housing','20'],
 ]){
  const route=`/${edition}/charities/${slug}`;
  await page.goto(route);
  await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.locator('.report-research-effort summary')).toHaveText(`Research time: ~${minutes} min on GPT-6 Astra Light`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter'+route);
  await expect(page.getByRole('link',{name:'Donate',exact:true})).toHaveAttribute('href',/^https:\/\//);
  await expect(page.locator('.report-contents a')).toHaveCount(7);
  await page.getByText('Model, assumptions and sensitivity',{exact:true}).click();
  await expect(page.getByRole('heading',{name:'Unresolved inputs',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const response=await request.get(`/api/geography-reports/${edition}/${slug}`);
  expect(response.ok()).toBeTruthy();
  const body=await response.json();
  expect(JSON.stringify(body)).not.toContain('/tmp/');
  expect(JSON.stringify(body)).not.toContain('/Users/');
 }
});
test('research table keeps unknown means unknown and shows audited recipient mean',async({page})=>{
 await page.goto('/california/research');
 const hrs=page.locator('tr').filter({hasText:'Harm Reduction Services'});
 await expect(hrs).toContainText('Not estimated');
 await page.goto('/usa/research');
 await expect(page.locator('tr').filter({hasText:'National Center for Healthy Housing'})).toContainText('$3.0M');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('desktop contents stay left and SF report still renders',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/usa/charities/national-center-for-healthy-housing');
 const toc=await page.locator('.report-contents').boundingBox();
 const summary=await page.locator('#summary').boundingBox();
 expect(toc&&summary&&toc.x+toc.width<=summary.x+2).toBeTruthy();
 await page.goto('/charities/marin-treatment-center');
 await expect(page.getByRole('heading',{name:'Marin Treatment Center',exact:true})).toBeVisible();
});
test('unknown reports return404',async({request})=>{
 expect((await request.get('/usa/charities/not-a-report')).status()).toBe(404);
 expect((await request.get('/api/geography-reports/usa/not-a-report')).status()).toBe(404);
});
