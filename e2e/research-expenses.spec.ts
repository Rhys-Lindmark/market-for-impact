import {test,expect} from '@playwright/test';
import expenses from '../data/research-expenses.json' with {type:'json'};
import {expenseSummary} from '../lib/research-expenses.mjs';
const canonical='https://ai.rhyslindmark.com/givebetter';
test.beforeEach(async({page,request,baseURL})=>{
 if(!baseURL||!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(baseURL))return;
 for(const pattern of [canonical+'/**','https://market-for-impact.rhyslindmark.chatgpt.site/_next/**']){
  await page.route(pattern,async route=>{
   const u=new URL(route.request().url());
   await route.fulfill({response:await request.get(new URL(u.pathname.replace(/^\/givebetter/,'')+u.search,baseURL).href,{maxRedirects:0})});
  });
 }
});
test('compact expense links open report appendices with accounting caveats',async({page})=>{
 await page.goto('/san-francisco/all');
 await expect(page.getByRole('columnheader',{name:'Avg. annual expenses (3 years)'})).toBeVisible();
 await expect(page.locator('[data-expense-details], [data-expense-years]')).toHaveCount(0);
 const recares=page.locator('[data-research-slug="recares"] a[data-average-expenses]');
 await expect(recares).toHaveAttribute('data-average-expenses','88845');
 await expect(recares).toHaveAttribute('href',/\/charities\/recares#annual-expenses$/);
 await expect(recares).not.toContainText(/FY|202[0-9]/);
 await recares.click();
 await expect(page).toHaveURL(/\/charities\/recares#annual-expenses$/);
 const appendix=page.locator('#annual-expenses');
 await expect(appendix).toHaveCount(1);
 await expect(appendix).toContainText('FY2025: $72,583');
 await expect(appendix.locator('a')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const slug of ['project-homeless-connect','st-anthony-foundation']){
  await page.goto('/san-francisco/all');
  const link=page.locator('[data-research-slug="'+slug+'"] a[href$="#annual-expenses"]');
  await expect(link).toHaveText('Not available');
  await link.click();
  await expect(page.locator('#annual-expenses')).toHaveCount(1);
  await expect(page.locator('#annual-expenses')).toContainText(slug==='project-homeless-connect'?'not PHC':'could overlap');
 }
 await expect(page.locator('#annual-expenses')).toContainText('FY2024: $39,138,512');
 await expect(page.locator('#annual-expenses')).toContainText('FY2023: $33,110,194');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('every stored expense record resolves to its own report appendix',async({page,request})=>{
 test.setTimeout(120_000);
 for(const [key,record] of Object.entries(expenses.organizations)){
  const slug=key==='ear-of-lion'?'ear-of-the-lion':key;
  const response=await request.get('/charities/'+slug);
  expect(response.ok(),slug+' report response').toBeTruthy();
  const html=await response.text();
  const rendered=await page.evaluate(html=>{
   const doc=new DOMParser().parseFromString(html,'text/html');
   const nodes=doc.querySelectorAll('#annual-expenses');
   return {count:nodes.length,text:nodes[0]?.textContent??'',average:nodes[0]?.getAttribute('data-average-expenses')??null,links:Array.from(nodes[0]?.querySelectorAll('a')??[]).map(a=>a.getAttribute('href'))};
  },html);
  expect(rendered.count,slug+' unique appendix').toBe(1);
  expect(rendered.text,slug+' correct recipient').toContain(record.entity);
  expect(rendered.text,slug+' accounting basis').toContain(record.basis);
  const {average}=expenseSummary(record);
  expect(rendered.average,slug+' mean').toBe(average===null?null:String(average));
  for(const row of record.years){expect(rendered.text,slug+' fiscal year').toContain('FY'+row.year+':');expect(rendered.links,slug+' original source').toContain(row.source);}
  if('note' in record&&record.note)expect(rendered.text,slug+' caveat').toContain(record.note);
 }
});
