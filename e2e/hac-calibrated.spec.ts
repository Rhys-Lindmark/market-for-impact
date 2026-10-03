import {test,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {calculateAll,historical} from '../lib/hac-calibrated-model.mjs';
test('HAC report, current list, historical API and per-model header stay synchronized',async({page,request})=>{
 await page.goto('/charities/housing-action-coalition');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Housing Action Coalition');
 await expect(page.locator('article')).toContainText('$238.60M');
 await expect(page.locator('article')).toContainText('$398.98M');
 await expect(page.locator('.report-research-effort')).toContainText('GPT-6.1 Sol');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const response=await request.get('/api/hac-v2-model');expect(response.ok()).toBe(true);const j=await response.json();
 assert.deepEqual(j.current.evaluated,JSON.parse(JSON.stringify(calculateAll())));
 assert.deepEqual(j.evaluated,JSON.parse(JSON.stringify(historical())));
 await page.goto('/san-francisco/all');await expect(page.locator('[data-research-slug="housing-action-coalition"]')).toHaveAttribute('data-cost-per-ten-qalys',String(j.current.central.donorPriceBay));
});
