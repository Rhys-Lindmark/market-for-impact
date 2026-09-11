import { expect, test } from '@playwright/test';

for (const path of ['/', '/san-francisco']) {
  test(`SF front door ${path} has four model-priced picks and research navigation`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our Top Charities');
    await expect(page.locator('.sf-home-charity')).toHaveCount(4);
    await expect(page.locator('.sf-home-org-card h4')).toHaveText(['The ReCARES Network', 'Project Homeless Connect', 'Pacific Hearing Connection', 'Pacific Vision Foundation']);
    await expect(page.locator('.sf-home-charity-body section:nth-child(2) strong')).toHaveCount(4);
    await expect(page.locator('.sf-home-scope')).toHaveText(['Whole organization; equipment-health component','Whole sponsored project; clinical-health components','Whole accounting cost; hearing-health component','Whole gift; first-eye health component']);
    await expect(page.getByRole('link', { name: 'All research', exact:true })).toHaveAttribute('href', 'https://ai.rhyslindmark.com/givebetter/research');
    await expect(page.locator('.sf-home-illustration')).toHaveCount(3);
    await expect(page.locator('#giving-priorities .sf-home-note')).toContainText('No marginal health offer has been verified');
    await expect(page.locator('#giving-priorities li')).toHaveCount(10);
    const prices=await page.locator('.sf-home-charity-body section:nth-child(2) strong').allTextContents();
    const slugs=await page.locator('.sf-home-charity').evaluateAll(ns=>ns.map(n=>n.id));
    await page.goto('/research');
    for(let i=0;i<slugs.length;i++){
      const value=Number(await page.locator('[data-research-slug="'+slugs[i]+'"]').getAttribute('data-cost-per-ten-qalys'));
      const expected=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumSignificantDigits:3}).format(value);
      expect(prices[i]).toBe(expected+' per better life (10 QALYs)');
    }
    await page.goto(path);
    for (const img of await page.locator('.sf-home-charity img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
