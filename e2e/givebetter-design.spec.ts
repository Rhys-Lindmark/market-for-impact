import { test, expect } from '@playwright/test';

for (const width of [390, 768, 1280]) {
  test(`GiveBetter layout and compact table at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height:900 });
    await page.goto('/');
    await expect(page.locator('.givebetter-masthead')).toContainText('GiveBetter x SF');
    await expect(page.locator('.sf-home-jump')).toHaveCount(0);
    await expect(page.locator('.sf-home-charity')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const first = page.locator('.sf-home-charity').first();
    await first.scrollIntoViewIfNeeded();
    await expect.poll(() => first.locator('img').evaluate((el:HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`givebetter-home-${width}.png`),fullPage:true});
    await page.goto('/research');
    await expect(page.locator('#top-research').getByRole('table')).toBeVisible();
    await expect(page.locator('#top-research tbody tr')).toHaveCount(53);
    await expect(page.locator('#top-research tbody')).not.toContainText('Exploratory estimate');
    await expect(page.locator('#top-research tbody')).not.toContainText('≈');
    const row = page.locator('tbody tr').first();
    expect((await row.boundingBox())!.height).toBeLessThan(135);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`givebetter-research-${width}.png`),fullPage:true});
    await row.locator('a').first().click();
    await expect(page).toHaveURL(/charities\/san-francisco-aids-foundation$/);
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
  });
}
