import {test,expect} from '@playwright/test';
import data from '../data/geography-reports.json' with {type:'json'};
import {reportPrice,formatEditionMoney} from '../lib/geography-reports.mjs';

test('Houston new initial reports show real prices, model minutes and no overflow',async({page})=>{
 test.setTimeout(60_000); // Bound cold route compilation across three navigations.
 await page.route('https://ai.rhyslindmark.com/givebetter/_next/**',async route=>{
  const path=new URL(route.request().url()).pathname.replace('/givebetter','');
  await route.fulfill({response:await page.request.get(path)});
 });
 for(const slug of ['avenue-360-health-and-wellness','allies-in-hope']){
  const r=data.reports.find(r=>r.edition==='houston'&&r.slug===slug)!;
  await page.goto('/houston/charities/'+slug,{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:r.organization,exact:true})).toBeVisible();
  await expect(page.locator('body')).toContainText('GPT-6.1 Sol');
  await expect(page.locator('body')).toContainText(formatEditionMoney(reportPrice(r)));
  await expect(page.locator('body')).not.toContainText('unrecorded AI model');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('/houston/all',{waitUntil:'domcontentloaded'});
 for(const slug of ['avenue-360-health-and-wellness','allies-in-hope'])await expect(page.locator('a[href$="/houston/charities/'+slug+'"]').first()).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
