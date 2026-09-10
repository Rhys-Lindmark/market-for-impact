import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {EXPECTED_RESEARCH_COUNT,EXPECTED_PUBLISHED_COUNT,EXPECTED_EXPANDED_COUNT} from './research-contract';

test('homepage and research copy refinements',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('Our four lowest central estimates so far.',{exact:false})).toHaveCount(0);
 expect(await page.locator('.givebetter-masthead small').evaluate(el=>getComputedStyle(el).fontFamily===getComputedStyle(el.parentElement!).fontFamily)).toBe(true);
 await page.goto('/research');
 await expect(page.locator('tbody')).not.toContainText('Not estimated');
 await expect(page.locator('#top-research').getByRole('columnheader',{name:'Organization',exact:true})).toBeVisible();
 await expect(page.getByRole('columnheader',{name:'$ per better life',exact:true})).toBeVisible();
 for(const cell of await page.locator('tbody td').all()) expect(await cell.innerText()).toMatch(/^\$[\d,]+(?:\.\dM|[KBT])?$/);
});

test('all published reports use readable research architecture',async({page},testInfo)=>{
 test.setTimeout(180000);
 await page.goto('/research');
 await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 const localReports=await page.locator('[data-research-slug]').evaluateAll(rows=>rows.map(row=>({href:row.querySelector('a')!.getAttribute('href')!})));
 await page.goto('/archive/expanded-geography-research');
 await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 const expandedReports=await page.locator('[data-research-slug]').evaluateAll(rows=>rows.map(row=>({href:row.querySelector('a')!.getAttribute('href')!})));
 const reports=[...localReports,...expandedReports];
 const registry=JSON.parse(fs.readFileSync('data/research-effort.json','utf8'));
 const seenOrganizations=new Set<string>();
 expect(new Set(reports.map(r=>r.href)).size).toBe(EXPECTED_PUBLISHED_COUNT);
 for(const item of reports){
  const response=await page.goto(item.href);
  expect(response?.status(),item.href).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  const organization=(await page.locator('h1').innerText()).trim();seenOrganizations.add(organization);
  await expect(page.locator('.report-heading [data-research-effort]')).toHaveCount(1);
  await expect(page.locator('.report-heading [data-research-effort]')).toBeVisible();
  await expect(page.locator('.report-heading [data-research-effort]')).toContainText(/research|Research/);
  await expect(page.locator('.report-heading [data-research-effort]')).toContainText(/^Research time: .+ on /);
  await expect(page.locator('.report-heading')).not.toContainText('Cost-effectiveness model:');
  await expect(page.locator('.report-footer .report-model-version')).toContainText('Cost-effectiveness model:');
  await expect(page.getByRole('navigation',{name:'Table of Contents'}).locator('a')).toHaveCount(7);
  const effort=page.locator('.report-heading [data-research-effort]');
  if(registry.organizations[organization]?.sessions.length){await expect(effort).toHaveAttribute('data-research-effort','recorded');if(registry.organizations[organization].coverage==='partial')await expect(effort.locator('summary')).toContainText('partial record');await effort.locator('summary').click();await expect(effort.locator('p')).toContainText('researcher');}
  for(const heading of ['Summary','1. What do they do?','2. Monitoring and information sharing','3. Qualitative assessment','4. What do you get for your dollar?','5. Funding and previous grants','6. Sources']) await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
  await expect(page.locator('.report-heading .report-donate')).toHaveText('Donate');
  await expect(page.locator('#funding')).toHaveCount(1);
  await expect(page.getByRole('table')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),item.href).toBe(true);
  await page.getByText('Model inputs and assumptions',{exact:true}).click();
  await expect(page.locator('.report-assumptions').first()).toBeVisible();
  expect(await page.locator('#summary p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
 }
 for(const organization of Object.keys(registry.organizations))expect(seenOrganizations.has(organization),'Unmatched provenance organization: '+organization).toBe(true);
 await page.goto('/charities/breathe-california');
 await page.screenshot({path:testInfo.outputPath('report-phone.png'),fullPage:true});
 await page.setViewportSize({width:1280,height:900});
 await page.screenshot({path:testInfo.outputPath('report-desktop.png'),fullPage:true});
});

test('research table of contents sits left on desktop and remains usable on narrow screens',async({page})=>{
 for(const slug of ['glide','marin-treatment-center']){
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/charities/'+slug);
  const nav=page.getByRole('navigation',{name:'Table of Contents'});
  const article=page.locator('.report-reading-column>article');
  const n=await nav.boundingBox(),a=await article.boundingBox();
  expect(n).not.toBeNull();expect(a).not.toBeNull();
  expect(n!.x+n!.width).toBeLessThan(a!.x);
  expect(Math.abs(n!.y-a!.y)).toBeLessThanOrEqual(25);
  expect(await nav.evaluate(el=>getComputedStyle(el).position)).toBe('sticky');
  await nav.getByRole('link',{name:'4. What do you get for your dollar?',exact:true}).click();
  await expect(page).toHaveURL(/#cost-effectiveness$/);
  await expect(page.locator('#cost-effectiveness h2')).toBeInViewport();
  await expect(nav).toBeInViewport();
  for(const width of [768,390]){
   await page.setViewportSize({width,height:900});await page.goto('/charities/'+slug);
   const narrowNav=await nav.boundingBox(),narrowArticle=await article.boundingBox();
   expect(narrowNav!.y+narrowNav!.height).toBeLessThanOrEqual(narrowArticle!.y+1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await nav.getByRole('link',{name:'6. Sources',exact:true}).click();
   await expect(page.locator('#sources h2')).toBeInViewport();
  }
 }
});
