import { expect, test } from '@playwright/test';

for (const path of ['/', '/san-francisco']) {
  test(`SF front door ${path} has four model-priced picks and research navigation`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our top charities');
    await expect(page.locator('.sf-home-charity')).toHaveCount(4);
    await expect(page.locator('.sf-home-org')).toHaveText(['GLIDE ↗', 'Compass Family Services ↗', 'Hamilton Families ↗', 'Five Keys Schools and Programs ↗']);
    await expect(page.locator('.sf-home-price')).toHaveText(['≈ $427K', '≈ $1.35M', '≈ $1.39M', '≈ $4.9M']);
    await expect(page.getByRole('link', { name: 'Rest of the research →' })).toHaveAttribute('href', 'https://ai.rhyslindmark.com/donate/research');
    await page.locator('.sf-home-charity summary').first().click();
    await expect(page.locator('.sf-home-charity details').first()).toContainText('no finite upper bound');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
