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
 for(const [edition,slug,name,minutes,donate] of [
  ['california','harm-reduction-services','Harm Reduction Services','28',true],
  ['usa','national-center-for-healthy-housing','National Center for Healthy Housing','20',true],
  ['california','operation-access','Operation Access','8',true],
  ['usa','legal-action-center','Legal Action Center','10',false],
  ['usa','end-overdose','End Overdose','7',true],
  ['california','end-overdose','End Overdose','14',true],
  ['usa','surgery-on-sunday','Surgery on Sunday','5',true],
  ['usa','the-headstrong-project','The Headstrong Project','6',true],
  ['usa','dental-lifeline-network','Dental Lifeline Network','12',true],
  ['california','homeless-health-care-los-angeles','Homeless Health Care Los Angeles','6',true],
  ['california','western-center-on-law-and-poverty','Western Center on Law & Poverty','6',true],
  ['california','worksafe','WorkSafe','8',true],
  ['california','coalition-for-clean-air','Coalition for Clean Air','5',true],
  ['california','disability-rights-california','Disability Rights California','8',true],
  ['usa','cribs-for-kids','Cribs for Kids','10',true],
  ['usa','upstream-usa','Upstream USA','11',true],
  ['california','center-for-independent-living','Center for Independent Living','11',true],
  ['california','comite-civico-del-valle','Comité Cívico del Valle','4',false],
  ['usa','help-america-hear','Help America Hear','11',false],
  ['usa','rx-outreach','Rx Outreach','9',true],
 ]){
  const route=`/${edition}/charities/${slug}`;
  await page.goto(route);
  await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.locator('.report-research-effort summary')).toHaveText(new RegExp(`^Research time: ~?${minutes} min on GPT-6 Astra Light$`));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter'+route);
  if(donate)await expect(page.locator('.report-donate')).toHaveAttribute('href',/^https:\/\//);
  else await expect(page.locator('.report-donate')).toHaveCount(0);
  await expect(page.locator('.report-contents a')).toHaveCount(7);
  await page.getByText('Model, assumptions and sensitivity',{exact:true}).click();
  await expect(page.getByRole('heading',{name:'Unresolved inputs',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const response=await request.get(`/api/geography-reports/${edition}/${slug}`);
  expect(response.ok()).toBeTruthy();
  const body=await response.json();
  expect(body.organization).toBe(name);
  expect(JSON.stringify(body)).not.toContain('/tmp/');
  expect(JSON.stringify(body)).not.toContain('/Users/');
 }
});
test('research table keeps unknown means unknown and shows audited recipient mean',async({page})=>{
 await page.goto('/california/research');
 const hrs=page.locator('tr').filter({hasText:'Harm Reduction Services'});
 await expect(hrs).toContainText('$3.1M');
 await expect(hrs).toContainText('Overdose-prevention benefits only');
 await expect(page.locator('tr').filter({hasText:'Center for Independent Living'})).toContainText('other benefits unestimated');
 await expect(page.locator('tr').filter({hasText:'Operation Access'})).toContainText('$1.9M');
 await expect(page.locator('tr').filter({hasText:'Operation Access'})).toContainText('$2.5M');
 await expect(page.locator('tr').filter({hasText:'Homeless Health Care Los Angeles'})).toContainText('$9.6M');
 await expect(page.locator('tr').filter({hasText:'Western Center on Law & Poverty'})).toContainText('$6.9M');
 await expect(page.locator('tr').filter({hasText:'WorkSafe'})).toContainText('Not estimated');
 await page.goto('/usa/research');
 await expect(page.locator('tr').filter({hasText:'National Center for Healthy Housing'})).toContainText('$3.0M');
 await expect(page.locator('tr').filter({hasText:'Legal Action Center'})).toContainText('Not estimated');
 await expect(page.locator('tr').filter({hasText:'Legal Action Center'})).toContainText('$8.6M');
 await expect(page.locator('tr').filter({hasText:'Surgery on Sunday'})).toContainText('$405K');
 await expect(page.locator('tr').filter({hasText:'Surgery on Sunday'})).toContainText('Not estimated');
 await expect(page.locator('tr').filter({hasText:'Dental Lifeline Network'})).toContainText('$744K');
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
