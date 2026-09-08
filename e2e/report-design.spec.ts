import {test,expect} from '@playwright/test';
import {sortedResearchPrograms} from '../lib/sf-research-index';

test('homepage and research copy refinements',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('Our four lowest central estimates so far.',{exact:false})).toHaveCount(0);
 expect(await page.locator('.givebetter-masthead small').evaluate(el=>getComputedStyle(el).fontFamily===getComputedStyle(el.parentElement!).fontFamily)).toBe(true);
 await page.goto('/research');
 await expect(page.locator('#top-research').getByRole('columnheader',{name:'Organization',exact:true})).toBeVisible();
 await expect(page.getByRole('columnheader',{name:'$ per better life',exact:true})).toBeVisible();
 for(const cell of await page.locator('tbody td').all()) expect(await cell.innerText()).toMatch(/^\$[\d,]+(?:\.\dM|[KBT])?$/);
});

test('all 46 reports use readable research architecture',async({page},testInfo)=>{
 test.setTimeout(180000);
 expect(sortedResearchPrograms).toHaveLength(46);
 for(const item of sortedResearchPrograms){
  const response=await page.goto(item.href);
  expect(response?.status(),item.href).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  for(const heading of ['Summary','1. What do they do?','2. Monitoring and information sharing','3. Qualitative assessment','4. What do you get for your dollar?','5. Funding and previous grants','6. Sources']) await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
  await expect(page.locator('.report-heading .report-donate')).toHaveText('Donate');
  await expect(page.locator('#funding')).toHaveCount(1);
  await expect(page.getByRole('table')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),item.href).toBe(true);
  await page.getByText('Model inputs and assumptions',{exact:true}).click();
  await expect(page.locator('.report-assumptions').first()).toBeVisible();
  expect(await page.locator('#summary p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
 }
 await page.goto('/charities/breathe-california');
 await page.screenshot({path:testInfo.outputPath('report-phone.png'),fullPage:true});
 await page.setViewportSize({width:1280,height:900});
 await page.screenshot({path:testInfo.outputPath('report-desktop.png'),fullPage:true});
});
