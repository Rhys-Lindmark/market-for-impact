import {expect,test} from '@playwright/test';
import reports from '../data/geography-reports.json' with {type:'json'};
import {reportPrice,formatEditionMoney} from '../lib/geography-reports.mjs';

for(const edition of ['california','usa']){
 test(`${edition} landing page shows four ranked research leads with photos`,async({page})=>{
  await page.route('https://ai.rhyslindmark.com/givebetter/images/**',async route=>{
   const path=new URL(route.request().url()).pathname.replace('/givebetter','');
   const response=await page.request.get(path);
   await route.fulfill({response});
  });
  await page.goto('/'+edition);
  const cards=page.locator('.sf-home-charity');
  await expect(cards).toHaveCount(4);
  const leaders=reports.reports.filter(r=>r.edition===edition&&reportPrice(r)!==null).sort((a,b)=>reportPrice(a)!-reportPrice(b)!).slice(0,4);
  for(const [i,report] of leaders.entries()){
   await expect(cards.nth(i).locator('h2')).toHaveText(report.organization);
   await expect(cards.nth(i)).toContainText(formatEditionMoney(reportPrice(report))+' per better life (10 QALYs)');
   await expect(cards.nth(i).getByRole('link',{name:'Full research report'})).toHaveAttribute('href',new RegExp('/'+edition+'/charities/'+report.slug+'$'));
   const image=cards.nth(i).locator('img');
   await image.scrollIntoViewIfNeeded();
   await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  }
  await expect(page.getByText('Our four-charity shortlist is being researched. Explore the full research list.')).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 });
}
