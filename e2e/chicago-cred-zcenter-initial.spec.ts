import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {reportPrice,formatEditionMoney} from '../lib/geography-reports.mjs';
const registry=JSON.parse(fs.readFileSync('data/geography-reports.json','utf8'));
const ids=['org:chicago-cred','ein:36-3314976'];
const reports=ids.map(id=>registry.reports.find((r:{edition:string;organizationId:string})=>r.edition==='chicago'&&r.organizationId===id));
test.beforeEach(async({page,baseURL})=>{if(baseURL?.startsWith('http://localhost:'))await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>route.fulfill({response:await route.fetch({url:baseURL+new URL(route.request().url()).pathname})}));});
for(const r of reports)test(r.organization+' report and API agree',async({page,request})=>{
 expect(r.acceptance.status).toBe('accepted');
 await page.goto('/chicago/charities/'+r.slug);
 await expect(page.getByRole('heading',{name:r.organization,exact:true})).toBeVisible();
 await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const res=await request.get('/api/geography-reports/chicago/'+r.slug);expect(res.ok()).toBeTruthy();
 const data=await res.json();expect(JSON.stringify(data)).not.toMatch(/\/tmp\/|\/Users\//);
 expect(data.model.scenarios.find((s:{id:string})=>s.id==='central').costPer10Qalys).toBeCloseTo(reportPrice(r),4);
});
test('Chicago list includes both current prices',async({page})=>{
 await page.goto('/chicago/all');
 for(const r of reports)await expect(page.locator('tr').filter({hasText:r.organization})).toContainText(formatEditionMoney(reportPrice(r)));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
