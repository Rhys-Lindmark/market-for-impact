import {test,expect} from '@playwright/test';
const slugs=["alameda-health-consortium","rainbow-community-center","easy-does-it","acknowledge-alliance","marin-county-bicycle-coalition","silicon-valley-bicycle-coalition","oakland-lgbtq-community-center"];
test('seven alpha reports preserve central API and navigable summaries',async({page,request})=>{
 for(const slug of slugs){
  const r=await request.get('/api/'+slug+'-model');expect(r.ok()).toBeTruthy();
  const d=await r.json();expect(d.comparison.basis).toBe('central scenario');expect(d.comparison.bayUsdPerTenQalys).toBeGreaterThan(1e6);
  await page.goto('/charities/'+slug);await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#summary')).toContainText('The research list uses the central scenario');
  await page.getByRole('navigation',{name:'Table of Contents'}).getByRole('link',{name:'6. Sources'}).click();
  await expect(page).toHaveURL(/#sources$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 }
 await page.goto('/research');
 for(const slug of slugs)await expect(page.locator('a[href="/charities/'+slug+'"]').first()).toBeVisible();
});
