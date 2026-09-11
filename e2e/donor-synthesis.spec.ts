import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
const priorities=JSON.parse(readFileSync(new URL('../data/bay/donor-priorities.json',import.meta.url),'utf8')) as {slug:string;scope:string;sourceURLs:string[]}[];

test('ten donor priorities preserve scope, evidence and usable disclosures',async({page})=>{
 await page.goto('/research/city-theory');
 await expect(page.getByRole('heading',{level:1})).toHaveText('What we learned from 100 reports');
 await expect(page.locator('.donor-priority')).toHaveCount(10);
 expect(new Set(priorities.map(p=>p.slug)).size).toBe(10);
 for(const item of priorities){
  const section=page.locator('#'+item.slug);
  await expect(section.getByRole('link').first()).toHaveAttribute('href','/charities/'+item.slug);
  await expect(section).toContainText(item.scope);
  await section.locator('summary').click();
  await expect(section.locator('li')).toHaveCount(2);
  await expect(section.locator('details a')).toHaveCount(item.sourceURLs.length);
 }
 await expect(page.getByText('None has a verified marginal health offer',{exact:false})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.setViewportSize({width:1440,height:1000});
 const aside=await page.locator('aside').boundingBox();
 const article=await page.locator('article').boundingBox();
 expect(aside!.x+aside!.width).toBeLessThanOrEqual(article!.x);
 await page.screenshot({path:'/private/tmp/mfi-donor-synthesis-desktop.png'});
 await page.goto('/');
 await page.screenshot({path:'/private/tmp/mfi-donor-home-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/private/tmp/mfi-donor-home-phone.png'});
});
