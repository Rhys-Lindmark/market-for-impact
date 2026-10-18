import {test,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {diagnostics,historical} from '../lib/pvf-calibrated-model.mjs';
test('PVF current report, API and listing remain synchronized and responsive',async({page,request})=>{
 await page.goto('/charities/pacific-vision-foundation');await expect(page.getByRole('heading',{level:1})).toHaveText('Pacific Vision Foundation');
 await expect(page.locator('article')).toContainText('$13.57M');await expect(page.locator('article')).toContainText('$30.53M');
 await expect(page.locator('.report-research-effort')).toContainText('GPT-6.1 Sol');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const links=page.getByRole('link',{name:'Donate',exact:true});await expect(links).toHaveCount(2);
 for(const link of await links.all())await expect(link).toHaveAttribute('href','https://pacificvisionfoundation.org/get-involved/ways-to-give/');
 const response=await request.get('/api/pvf-portfolio-model');expect(response.ok()).toBe(true);const data=await response.json();
 assert.deepEqual(data.current.evaluated,diagnostics());assert.deepEqual(data.evaluated,historical());
 await page.goto('/san-francisco/all');await expect(page.locator('[data-research-slug="pacific-vision-foundation"]')).toHaveAttribute('data-cost-per-ten-qalys',String(data.current.evaluated.central.regions.bay.donorPrice10));
});
