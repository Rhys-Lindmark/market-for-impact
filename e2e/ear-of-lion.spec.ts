import {test,expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT,EXPECTED_EXPANDED_COUNT} from './research-contract';
test('Ear of the Lion archive separates Bay from broader hearing health',async({page})=>{
 await page.goto('/research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
 await expect(page.locator('[data-research-slug="ear-of-the-lion"]')).toHaveCount(0);
 await page.goto('/archive/expanded-geography-research');await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_EXPANDED_COUNT);
 const row=page.locator('[data-research-slug="ear-of-the-lion"]');await expect(row).toContainText('California / Nevada');
 await row.locator('a').first().click();await expect(page.locator('h1')).toContainText('Ear of the Lion');
 await expect(page.locator('#evidence')).toContainText('modified HUI3');
 await expect(page.locator('#evidence')).toContainText('66%');
 await expect(page.locator('.report-research-effort summary')).toContainText('4 min');
 const response=await page.request.get('/api/ear-of-lion-model');expect(response.ok()).toBe(true);
 const api=await response.json();expect(api.evaluated.bayCostPer10).toBe(1311103.9254995799);
 expect(api.evaluated.allCostPer10).toBeLessThan(api.evaluated.bayCostPer10);
 expect(api.anchors.expense).toBe(101368);expect(api.verifiedMarginalFundingOffer).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
