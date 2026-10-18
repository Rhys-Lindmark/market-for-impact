import{test,expect}from'@playwright/test';
import fs from'node:fs';
import{reportPrice,formatEditionMoney}from'../lib/geography-reports.mjs';
import{featuredReports}from'../lib/edition-featured.mjs';
const registry=JSON.parse(fs.readFileSync('data/geography-reports.json','utf8'));
const slugs=['maternal-mental-health-now','human-options','public-law-center'];
test.beforeEach(async({page,baseURL})=>{
 if(baseURL?.startsWith('http://localhost:'))await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{
  await route.fulfill({response:await route.fetch({url:baseURL+new URL(route.request().url()).pathname})});
 });
});
for(const slug of slugs){
 test(slug+' has accepted current price, safe provenance and responsive report',async({page,request})=>{
  const report=registry.reports.find((r:{edition:string;slug:string})=>r.edition==='los-angeles'&&r.slug===slug);
  expect(report.stage).toBe('beta');expect(report.acceptance.status).toBe('accepted');
  const route='/los-angeles/charities/'+slug;await page.goto(route);
  await expect(page.getByRole('heading',{name:report.organization,exact:true})).toBeVisible();
  await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
  await expect(page.locator('.report-research-effort summary')).not.toContainText('unrecorded');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://ai.rhyslindmark.com/givebetter'+route);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const response=await request.get('/api/geography-reports/los-angeles/'+slug);expect(response.ok()).toBeTruthy();
  const data=await response.json();expect(JSON.stringify(data)).not.toMatch(/\/tmp\/|\/Users\//);
  expect(data.model.scenarios.find((s:{id:string})=>s.id==='central').costPer10Qalys).toBeCloseTo(reportPrice(report),4);
 });
}
test('LA list matches all final deep estimates without expense detail clutter',async({page})=>{
 await page.goto('/los-angeles/all');
 for(const slug of slugs){const report=registry.reports.find((r:{edition:string;slug:string})=>r.edition==='los-angeles'&&r.slug===slug);await expect(page.locator('tr').filter({hasText:report.organization})).toContainText(formatEditionMoney(reportPrice(report)));}
 await expect(page.locator('[data-expense-details]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('LA landing has the same four current research leaders and loaded sourced images',async({page})=>{
 const picks=featuredReports(registry.reports,'los-angeles');expect(picks).toHaveLength(4);
 await page.goto('/los-angeles');
 const cards=page.locator('.sf-home-charity');await expect(cards).toHaveCount(4);
 for(let i=0;i<picks.length;i++){
  const card=cards.nth(i);await card.scrollIntoViewIfNeeded();
  await expect(card.getByRole('heading',{name:picks[i].organization,exact:true}).first()).toBeVisible();
  await expect(card).toContainText(formatEditionMoney(reportPrice(picks[i])));
  await expect.poll(()=>card.locator('figure img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0),{timeout:20000}).toBeTruthy();
  await expect(card.locator('figcaption a')).toHaveAttribute('href',/^https:\/\//);
  if(page.viewportSize()?.width===390)await card.locator('figure').screenshot({path:'test-results/la-feature-'+picks[i].slug+'.png'});
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'test-results/la-featured-'+page.viewportSize()?.width+'.png',fullPage:true});
 await page.goto('/los-angeles/all');
 const shared=page.getByRole('region',{name:'Four featured opportunities'});
 for(const pick of picks)await expect(shared.getByRole('link',{name:pick.organization,exact:true})).toBeVisible();
});
