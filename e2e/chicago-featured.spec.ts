import {test,expect} from '@playwright/test';
import data from '../data/geography-reports.json' with {type:'json'};
import {featuredReports} from '../lib/edition-featured.mjs';
import {reportPrice,formatEditionMoney} from '../lib/geography-reports.mjs';

test('Chicago shares four evidence-weighted features, loaded images and current prices',async({page})=>{
 await page.route('https://ai.rhyslindmark.com/givebetter/_next/**',async route=>{
  const path=new URL(route.request().url()).pathname.replace('/givebetter','');
  await route.fulfill({response:await page.request.get(path)});
 });
 const picks=featuredReports(data.reports,'chicago');
 expect(picks.map(r=>r.slug)).toEqual(['old-irving-park-community-clinic','legal-council-for-health-justice','dupage-health-coalition','youth-guidance']);
 await page.goto('/chicago');
 const cards=page.locator('.sf-home-charity');await expect(cards).toHaveCount(4);
 for(const [i,r] of picks.entries()){
  await expect(cards.nth(i).locator('h2')).toHaveText(r.organization);
  await expect(cards.nth(i)).toContainText(formatEditionMoney(reportPrice(r))+' per better life');
  const img=cards.nth(i).locator('img');await img.scrollIntoViewIfNeeded();
  await expect.poll(()=>img.evaluate((x:HTMLImageElement)=>x.complete&&x.naturalWidth>0)).toBe(true);
 }
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/chicago/all');
 const shared=page.getByRole('region',{name:'Four featured opportunities'});
 const hrefs=await shared.locator('a').evaluateAll(a=>a.map(x=>new URL((x as HTMLAnchorElement).href).pathname));
 expect(hrefs).toEqual(picks.map(r=>'/givebetter/chicago/charities/'+r.slug));
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
