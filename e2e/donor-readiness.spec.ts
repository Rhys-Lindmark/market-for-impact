import {test,expect} from '@playwright/test';
import readiness from '../data/donor-readiness.json' with {type:'json'};
test('each current top-ten report displays its specific giving assessment',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 for(const row of readiness.reviews){
  expect((await page.goto('/charities/'+row.slug))?.ok()).toBe(true);
  const assessment=page.getByRole('complementary',{name:'Giving assessment'});
  await expect(assessment).toContainText(row.reason);
  await assessment.locator('summary').click();
  await expect(assessment).toContainText('not verified capacity to absorb a $10 million gift');
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
