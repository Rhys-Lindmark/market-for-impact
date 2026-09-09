import { expect, test } from '@playwright/test';

for (const path of ['/', '/san-francisco']) {
  test(`SF front door ${path} has four model-priced picks and research navigation`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our Top Charities');
    await expect(page.locator('.sf-home-charity')).toHaveCount(4);
    await expect(page.locator('.sf-home-org-card h4')).toHaveText(['GLIDE', 'Breathe California', 'Operation Access', 'Pacific Vision Foundation']);
    await expect(page.locator('.sf-home-charity-body section:nth-child(2) strong')).toHaveText(['$427K per better life (10 QALYs)', '$533K per better life (10 QALYs)', '$600K per better life (10 QALYs)', '$714K per better life (10 QALYs)']);
    await expect(page.getByRole('link', { name: 'All research', exact:true })).toHaveAttribute('href', 'https://ai.rhyslindmark.com/givebetter/research');
    await expect(page.locator('.sf-home-illustration')).toHaveCount(3);
    await expect(page.locator('.sf-home-note')).toHaveCount(0);
    for (const img of await page.locator('.sf-home-charity img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
