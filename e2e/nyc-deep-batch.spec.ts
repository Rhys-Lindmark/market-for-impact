import {expect,test} from '@playwright/test';
test('SACHR current report/list/API price, signed welfare and model time agree',async({page,request})=>{
 const route='/new-york-city/charities/st-ann-s-corner-of-harm-reduction';
 await page.goto(route);
 await expect(page.locator('h1')).toHaveText("St. Ann's Corner of Harm Reduction");
 await expect(page.locator('#summary')).toContainText('$22.3M per better life');
 const effort=page.locator('.report-research-effort summary');
 await expect(effort).toContainText('min on GPT-6.1 Sol');
 await expect(effort).toContainText('min on GPT-6 Astra Light');
 await expect(page.locator('.report-income-comparison')).toContainText('−0.0001328'.replace('−','-'));
 await expect(page.locator('#annual-expenses')).toContainText('FY 2025: $5.3M');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const api=await request.get('/api/geography-reports/new-york-city/st-ann-s-corner-of-harm-reduction');
 expect(api.ok()).toBe(true);
 const payload=await api.json();
 expect(JSON.stringify(payload)).toContain('nyc-sachr');
 await page.goto('/new-york-city/all');
 const row=page.locator('tr').filter({has:page.locator('a[href$="/new-york-city/charities/st-ann-s-corner-of-harm-reduction"]')});
 await expect(row).toContainText('$22.3M');
 const details=page.getByText('Research progress',{exact:true});
 await details.click();
 await expect(page.locator('.gb-edition-boundary').first()).toContainText('10/10 in-depth reviews');
});
for(const [slug,name,price] of [['charles-b-wang-community-health-center','Charles B. Wang Community Health Center','$24.3M'],['sanctuary-for-families','Sanctuary for Families','$207.1M'],['onpoint-nyc','OnPoint NYC','$29.4M'],['mobilization-for-justice','Mobilization for Justice','$44.1M'],['god-s-love-we-deliver',"God's Love We Deliver",'$41.1M']]){
 test(`${name} accepted health-income report agrees with research list and API`,async({page,request})=>{
  await page.goto('/new-york-city/charities/'+slug);
  await expect(page.locator('h1')).toHaveText(name);
  await expect(page.locator('#summary')).toContainText(price+' per better life');
  await expect(page.locator('.report-research-effort summary')).toContainText('min on GPT-6.1 Sol');
  await expect(page.locator('.report-income-comparison')).toBeVisible();
  await expect(page.locator('#annual-expenses')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const api=await request.get('/api/geography-reports/new-york-city/'+slug);expect(api.ok()).toBe(true);
  const payload=await api.json();expect(payload.model.scenarios.some(s=>s.id==='central')).toBe(true);
  await page.goto('/new-york-city/all');
  const row=page.locator('tr').filter({has:page.locator('a[href$="/new-york-city/charities/'+slug+'"]')});
  await expect(row).toContainText(price);
 });
}
test('Samaritans reports revised welfare price without crediting stalled modeling time',async({page})=>{
 await page.goto('/new-york-city/charities/samaritans-of-new-york');
 await expect(page.locator('h1')).toHaveText('Samaritans of New York');
 await expect(page.locator('#summary')).toContainText('$30.7M per better life');
 await expect(page.locator('.report-income-comparison')).toContainText('-0.00005663');
 await expect(page.locator('.report-research-effort summary')).toContainText('min on GPT-6.1 Sol');
 await expect(page.locator('#funding')).toContainText('not a consecutive three-year series');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/new-york-city/all');
 const row=page.locator('tr').filter({has:page.locator('a[href$="/new-york-city/charities/samaritans-of-new-york"]')});
 await expect(row).toContainText('$30.7M');
});
