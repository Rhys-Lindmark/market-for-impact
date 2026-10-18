import {test,expect} from '@playwright/test';
test('Hamilton shows calibrated award welfare and recorded revision provenance',async({page})=>{
 await page.goto('/charities/hamilton-families');
 await expect(page.getByRole('heading',{name:'Hamilton Families',exact:true})).toBeVisible();
 const effort=page.locator('.report-research-effort');
 await expect(effort.locator('summary')).toContainText('GPT-6.1 Sol');
 await expect(effort.locator('summary')).toContainText('GPT-5.6 Sol Medium');
 const cost=page.locator('#cost-effectiveness');
 await expect(cost).toContainText('$2.61M per better life');
 await expect(cost).toContainText('0.038197 income-equivalent');
 await expect(cost).toContainText('0.000124 noncash health-proxy');
 await expect(cost).toContainText('not measured clinical QALYs');
 await expect(cost).toContainText('No finite positive price');
 await expect(page.locator('#funding')).toContainText('$21,402,215');
 await expect(page.locator('#funding')).toContainText('June 30, 2025');
 await expect(page.locator('.report-heading')).not.toContainText('V2 beta');
 await expect(page.locator('#sources a[href="https://coefficientgiving.org/research/cost-effectiveness/"]')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
