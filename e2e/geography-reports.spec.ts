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
  ['new-york-city','transportation-alternatives','Transportation Alternatives','4',true],
  ['new-york-city','onpoint-nyc','OnPoint NYC','6',true],
  ['new-york-city','bergen-volunteer-medical-initiative','Bergen Volunteer Medical Initiative','4',true],
  ['new-york-city','new-york-lawyers-for-the-public-interest','New York Lawyers for the Public Interest','4',true],
  ['new-york-city','new-york-city-environmental-justice-alliance','New York City Environmental Justice Alliance','6',true],
  ['new-york-city','new-jersey-harm-reduction-coalition','New Jersey Harm Reduction Coalition','4',true],
  ['new-york-city','northern-manhattan-perinatal-partnership',"Northern Manhattan Perinatal Partnership",'5',true],
  ['new-york-city','common-justice',"Common Justice",'6',true],
  ['new-york-city','newark-community-street-team',"Newark Community Street Team",'6',true],
  ['new-york-city','we-act-for-environmental-justice',"WE ACT for Environmental Justice",'3',true],
  ['new-york-city','the-center-for-great-expectations',"The Center for Great Expectations",'3',true],
  ['new-york-city','new-york-legal-assistance-group',"New York Legal Assistance Group",'4',true],
  ['new-york-city','st-ann-s-corner-of-harm-reduction',"St. Ann's Corner of Harm Reduction",'4',true],
  ['new-york-city','new-jersey-environmental-justice-alliance',"New Jersey Environmental Justice Alliance",'4',true],
  ['new-york-city','parker-family-health-center',"Parker Family Health Center",'4',true],
  ['california','community-water-center','Community Water Center','9',true],
  ['california','california-pan-ethnic-health-network','California Pan-Ethnic Health Network','7',true],
  ['california','california-dental-association-foundation','California Dental Association Foundation','4',true],
  ['california','essential-access-health','Essential Access Health','9',true],
  ['california','california-yimby-education-fund','California YIMBY Education Fund','7',true],
  ['california','didi-hirsch-mental-health-services','Didi Hirsch Mental Health Services','14',true],
  ['california','breathe-southern-california','Breathe Southern California','12',true],
  ['california','champions-for-health','Champions for Health','7',true],
  ['california','childrens-partnership',"The Children's Partnership",'9',true],
  ['california','nourish-california','Nourish California','6',true],
  ['california','california-school-based-health-alliance','California School-Based Health Alliance','7',true],
  ['los-angeles','hunger-action-los-angeles','Hunger Action Los Angeles','45',true],
  ['los-angeles','illumination-foundation','Illumination Health + Home','5',true],
  ['los-angeles','dayle-mcintosh-center','Dayle McIntosh Center','5',true],
  ['los-angeles','garment-worker-center','Garment Worker Center','18',true],
  ['los-angeles','housing-rights-center','Housing Rights Center','5',true],
  ['los-angeles','downtown-women-s-center',"Downtown Women's Center",'7',true],
  ['los-angeles','radiant-health-centers','Radiant Health Centers','7',true],
  ['los-angeles','didi-hirsch-mental-health-services','Didi Hirsch Mental Health Services','13',true],
  ['los-angeles','john-tracy-center','John Tracy Center','10',true],
  ['los-angeles','sycamores','Sycamores','7',true],
  ['los-angeles','bienestar-human-services','Bienestar Human Services','12',true],
  ["los-angeles","communities-for-a-better-environment","Communities for a Better Environment","10",true],
  ["los-angeles","east-yard-communities-for-environmental-justice","East Yard Communities for Environmental Justice","13",false],
  ["los-angeles","vietnamese-american-cancer-foundation","Vital Access Care Foundation (Vietnamese American Cancer Foundation)","8",true],
  ["los-angeles","maternal-mental-health-now","Maternal Mental Health NOW","7",true],
  ["los-angeles","urban-peace-institute","Urban Peace Institute","25",true],
  ["los-angeles","public-law-center","Public Law Center","32",true],
  ["los-angeles","inner-city-law-center","Inner City Law Center","8",true],
  ["los-angeles","human-options","Human Options","9",true],
  ['usa','shatterproof','Shatterproof','16',false],
  ['usa','food-research-and-action-center','Food Research & Action Center','12',true],
  ['usa','center-for-environmental-health','Center for Environmental Health','13',false],
  ['usa','toxic-free-future','Toxic-Free Future','12',false],
  ['usa','farmworker-justice','Farmworker Justice','12',false],
  ['usa','earthjustice','Earthjustice','6',false],
  ['los-angeles','lestonnac-free-clinic','Lestonnac Free Clinic','18',true],
  ['los-angeles','streets-are-for-everyone','Streets Are For Everyone','11',true],
  ['los-angeles','breathe-southern-california','Breathe Southern California','11',true],
  ['los-angeles','neighborhood-legal-services-los-angeles-county','Neighborhood Legal Services of Los Angeles County','8',true],
  ['los-angeles','climate-resolve','Climate Resolve','7',true],
  ['los-angeles','coalition-for-clean-air','Coalition for Clean Air','13',true],
  ['usa','remote-area-medical','Remote Area Medical','10',true],
  ['usa','immunize-org','Immunize.org','10',true],
  ['usa','green-and-healthy-homes-initiative','Green & Healthy Homes Initiative','6',true],
  ['usa','american-nonsmokers-rights-foundation','American Nonsmokers’ Rights Foundation','7',true],
  ['california','national-health-law-program','National Health Law Program','26',true],
  ['usa','national-health-law-program','National Health Law Program','24',true],
  ['usa','institute-for-safer-trucking','Institute for Safer Trucking','5',true],
  ['usa','us-alcohol-policy-alliance','US Alcohol Policy Alliance','8',true],
  ['california','harm-reduction-services','Harm Reduction Services','40',true],
  ['usa','national-center-for-healthy-housing','National Center for Healthy Housing','20',true],
  ['california','operation-access','Operation Access','21',true],
  ['usa','legal-action-center','Legal Action Center','10',false],
  ['usa','end-overdose','End Overdose','47',true],
  ['california','end-overdose','End Overdose','20',true],
  ['usa','surgery-on-sunday','Surgery on Sunday','19',true],
  ['usa','the-headstrong-project','The Headstrong Project','6',true],
  ['usa','dental-lifeline-network','Dental Lifeline Network','24',true],
  ['california','homeless-health-care-los-angeles','Homeless Health Care Los Angeles','6',true],
  ['california','western-center-on-law-and-poverty','Western Center on Law & Poverty','11',true],
  ['california','worksafe','WorkSafe','14',true],
  ['california','coalition-for-clean-air','Coalition for Clean Air','5',true],
  ['california','disability-rights-california','Disability Rights California','13',true],
  ['usa','cribs-for-kids','Cribs for Kids','10',true],
  ['usa','upstream-usa','Upstream USA','11',true],
  ['california','center-for-independent-living','Center for Independent Living','11',true],
  ['california','comite-civico-del-valle','Comité Cívico del Valle','6',false],
  ['usa','help-america-hear','Help America Hear','11',false],
  ['usa','rx-outreach','Rx Outreach','9',true],
  ['usa','center-for-science-in-the-public-interest','Center for Science in the Public Interest','30',true],
  ['usa','kids-and-car-safety','Kids and Car Safety','9',true],
  ['california','youth-alive','Youth ALIVE!','9',true],
  ['california','vision-to-learn','Vision To Learn','7',true],
  ['california','walk-san-francisco','Walk San Francisco','5',true],
 ]){
  const route=`/${edition}/charities/${slug}`;
  await page.goto(route);
  await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  const models=(edition==='usa'&&['end-overdose','center-for-science-in-the-public-interest','surgery-on-sunday','dental-lifeline-network'].includes(slug))||(edition==='los-angeles'&&['urban-peace-institute','lestonnac-free-clinic'].includes(slug))||(edition==='california'&&['operation-access','harm-reduction-services'].includes(slug))?'GPT-6 Astra Light \\+ GPT-6 Astra Medium':'GPT-6 Astra Light';
  await expect(page.locator('.report-research-effort summary')).toHaveText(new RegExp(`^Research time: ~?${minutes} min on ${models}$`));
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
 await page.goto('/los-angeles/all');
 await expect(page.locator('tr').filter({hasText:'Lestonnac Free Clinic'})).toContainText('$2.8M');
 await expect(page.locator('tr').filter({hasText:'Lestonnac Free Clinic'})).toContainText('$4.1M');
 await expect(page.locator('tr').filter({hasText:'Breathe Southern California'})).toContainText('$428.3M');
 await expect(page.locator('tr').filter({hasText:'Breathe Southern California'})).toContainText('$2.4M');
 await expect(page.locator('tr').filter({hasText:'Climate Resolve'}).getByTitle('Local heat health only; other impacts unestimated')).toHaveText('$14.1M');
 await expect(page.locator('[data-expense-details]')).toHaveCount(0);
 await page.goto('/california/all');
 const hrs=page.locator('tr').filter({hasText:'Harm Reduction Services'});
 await expect(hrs).toContainText('$3.1M');
 await expect(page.locator('[data-expense-details]')).toHaveCount(0);
 await expect(page.locator('[data-research-table]')).toHaveCount(1);
 await expect(page.locator('tr').filter({hasText:'Operation Access'})).toContainText('$1.9M');
 await expect(page.locator('tr').filter({hasText:'Operation Access'})).toContainText('$2.5M');
 await expect(page.locator('tr').filter({hasText:'Homeless Health Care Los Angeles'})).toContainText('$9.6M');
 await expect(page.locator('tr').filter({hasText:'Western Center on Law & Poverty'})).toContainText('$7.1M');
 await expect(page.locator('tr').filter({hasText:'WorkSafe'})).toContainText('$161.3M');
 await expect(page.locator('tr').filter({hasText:'WorkSafe'}).getByTitle('Legal-protection health only; other impacts unestimated')).toHaveText('$161.3M');
 await expect(page.locator('tr').filter({hasText:'Disability Rights California'})).toContainText('$64.8M');
 await page.goto('/usa/all');
 await expect(page.locator('tr').filter({hasText:'Shatterproof'})).toContainText('$44.8M');
 await expect(page.locator('tr').filter({hasText:'Earthjustice'}).getByTitle('PM implementation health only; other impacts unestimated')).toHaveText('$35.4M');
 await expect(page.locator('tr').filter({hasText:'Center for Environmental Health'})).toContainText('$2192.9M');
 await expect(page.locator('tr').filter({hasText:'National Center for Healthy Housing'})).toContainText('$3.0M');
 await expect(page.locator('tr').filter({hasText:'Legal Action Center'})).toContainText('$239.9M');
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
