import { expect, test } from '@playwright/test';

for (const path of ['/', '/san-francisco']) {
  test(`SF front door ${path} has four model-priced picks and research navigation`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our Top Charities');
    await expect(page.locator('.sf-home-charity')).toHaveCount(4);
    await expect(page.locator('.sf-home-org-card h4')).toHaveText(['San Francisco AIDS Foundation', 'Project Homeless Connect', 'GLIDE', 'Breathe California']);
    await expect(page.locator('.sf-home-charity-body section:nth-child(2) strong')).toHaveText(['$56.3K per better life (10 QALYs)', '$71.1K per better life (10 QALYs)', '$427K per better life (10 QALYs)', '$533K per better life (10 QALYs)']);
    await expect(page.getByRole('link', { name: 'All research', exact:true })).toHaveAttribute('href', 'https://ai.rhyslindmark.com/givebetter/research');
    await expect(page.locator('.sf-home-illustration')).toHaveCount(3);
    await expect(page.locator('.sf-home-note')).toContainText('marginal funding room is unverified');
    for (const img of await page.locator('.sf-home-charity img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
