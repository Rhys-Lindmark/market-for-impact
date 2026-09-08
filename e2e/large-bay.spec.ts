import {test,expect} from '@playwright/test';
test('large Bay discovery stays distinct from impact ranking',async({page})=>{
await page.goto('/research/large-bay-nonprofits');await expect(page.getByRole('heading',{level:1})).toHaveText('Five large Bay Area nonprofits worth examining.');
await expect(page.locator('[data-bay-org]')).toHaveCount(5);await expect(page.locator('main')).toContainText('not an exhaustive largest-five ranking');
await expect(page.locator('main')).toContainText('$261,211,852');await expect(page.locator('main')).toContainText('Goodwill');
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
await page.getByRole('link',{name:'All research →'}).click();await expect(page.getByRole('link',{name:'Five large Bay Area nonprofits worth examining →'})).toBeVisible();
});
