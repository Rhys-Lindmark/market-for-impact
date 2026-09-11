import {test,expect} from '@playwright/test';
const cases=[['micahs-hugs',4751636.03088788],['berkeley-need',2079004.2872646614],['hope-pacifica',554659.5517271358]] as const;
test('three reports, model links and central comparison prices agree',async({page,request})=>{
 for(const [slug,price] of cases){
  const response=await request.get('/api/'+slug+'-model');
  expect(response.ok()).toBeTruthy();
  const {evaluated}=await response.json();
  const central=evaluated.centralScenario??(evaluated.rows??evaluated.results).find((r:{id:string})=>r.id==='central');
  expect(central.bayCostPer10).toBeCloseTo(price,5);
  await page.goto('/charities/'+slug);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#summary')).toContainText('The research list uses the central scenario');
  await page.getByRole('navigation',{name:'Table of Contents'}).getByRole('link',{name:'4. What do you get for your dollar?'}).click();
  await expect(page).toHaveURL(/#cost-effectiveness$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 }
 await page.goto('/research');
 for(const [slug] of cases)await expect(page.locator('a[href="/charities/'+slug+'"]').first()).toBeVisible();
 await page.goto('/');
 await expect(page.locator('a[href*="hope-pacifica"]').first()).toBeVisible();
});
