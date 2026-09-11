import {test,expect} from '@playwright/test';
test('donor links distinguish general support and missing routes',async({page})=>{
 await page.goto('/charities/glide');
 await expect(page.locator('.report-donate').first()).toHaveAttribute('href','https://www.glide.org/give/');
 await expect(page.locator('.report-donation-note')).toContainText('not the separate Church option');
 await expect(page.locator('.report-donation-note')).toContainText('not verified');
 await page.goto('/charities/breathe-california');
 const funding=page.getByRole('link',{name:'Funding limitations',exact:true});
 await expect(funding).toHaveAttribute('href','#funding');await funding.click();
 await expect(page.locator('#funding')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/charities/recares');await expect(page.locator('.report-donate').first()).toHaveAttribute('href','https://www.recares.org/financial-donations/');
});
