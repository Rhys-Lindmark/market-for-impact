import{test,expect}from'@playwright/test';
import fs from'node:fs';
import{reportPrice,formatEditionMoney}from'../lib/geography-reports.mjs';
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
