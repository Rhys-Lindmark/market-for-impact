import {test,expect} from '@playwright/test';
test('Both global reports explain native mortality versus QALY estimates',async({page})=>{
 for(const [slug,price] of [['against-malaria-foundation','$5,500'],['new-incentives','$4,500']]){
 await page.goto('/charities/'+slug);
 await expect(page.getByRole('heading',{name:'Why does this differ from GiveWell?'})).toBeVisible();
 await expect(page.locator('body')).toContainText(price);await expect(page.locator('body')).toContainText('13.65');
 await expect(page.locator('body')).toContainText('constructed scenario');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 const d=await(await page.request.get('/api/givewell-reconciliation')).json();
 expect(d.comparisons[0].illustrative50Conversion.usdPer10Qalys).toBe(1100);
 expect(d.comparisons[1].illustrative50Conversion.usdPer10Qalys).toBe(900);
 await page.goto('/research');await expect(page.locator('table')).toHaveCount(1);await expect(page.locator('[data-research-slug]')).toHaveCount(51);
});
