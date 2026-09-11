import {test,expect} from '@playwright/test';
import readiness from '../data/donor-readiness.json' with {type:'json'};
test('giving caveats live in funding sections without report banners',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 for(const row of readiness.reviews){
  expect((await page.goto('/charities/'+row.slug))?.ok()).toBe(true);
  const assessment=page.locator('#funding [data-funding-assessment], #research-funding [data-funding-assessment]');
  await expect(assessment).toContainText(row.reason);
  await expect(page.getByText('Before a major gift',{exact:true})).toHaveCount(0);
  await expect(page.locator('.report-donor-readiness')).toHaveCount(0);
  await expect(page.locator('article')).not.toContainText(row.status);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 await page.goto('/research');
 for(const row of readiness.reviews)await expect(page.locator('[data-research-slug="'+row.slug+'"]')).toContainText(row.short);
 await expect(page.getByText('Our ten giving priorities')).toHaveCount(0);
 await page.goto('/charities/hope-pacifica');
 const prose=await page.locator('article').innerText();
 expect(prose).toContain('Form 990');
 expect(prose).toContain('August 19, 2026');
 expect(prose).not.toMatch(/Form990|August19|per10|BayQALYs|About1,109/);
});
