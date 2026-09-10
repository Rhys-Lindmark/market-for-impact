import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';

test('homepage and research copy refinements',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('Our four lowest central estimates so far.',{exact:false})).toHaveCount(0);
 expect(await page.locator('.givebetter-masthead small').evaluate(el=>getComputedStyle(el).fontFamily===getComputedStyle(el.parentElement!).fontFamily)).toBe(true);
 await page.goto('/research');
 await expect(page.locator('tbody')).not.toContainText('Not estimated');
 await expect(page.locator('#top-research').getByRole('columnheader',{name:'Organization',exact:true})).toBeVisible();
 await expect(page.getByRole('columnheader',{name:'$ per better life',exact:true})).toBeVisible();
 for(const cell of await page.locator('tbody td').all()) expect(await cell.innerText()).toMatch(/^\$[\d,]+(?:\.\dM|[KBT])?\n(?:SF|BAY AREA)$/);
});

test('all published reports use readable research architecture',async({page},testInfo)=>{
 test.setTimeout(180000);
 await page.goto('/research');
 await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const reports=await page.locator('[data-research-slug]').evaluateAll(rows=>rows.map(row=>({href:row.querySelector('a')!.getAttribute('href')!})));
 expect(new Set(reports.map(r=>r.href)).size).toBe(EXPECTED_RESEARCH_COUNT);
 for(const item of reports){
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
