import { expect, test } from '@playwright/test';

for (const path of ['/', '/san-francisco']) {
  test(`SF front door ${path} has four evidence-reviewed leads and photographs`, async ({ page, request }) => {
    await page.route('https://ai.rhyslindmark.com/givebetter/images/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname.replace('/givebetter',''))});});
    await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our Bay Area Shortlist');
    await expect(page.locator('.sf-home-charity')).toHaveCount(4);
    await expect(page.locator('.sf-home-org-card h4')).toHaveText(['The ReCARES Network', 'Project Homeless Connect', 'Compass Family Services', 'San Francisco AIDS Foundation']);
    await expect(page.locator('.sf-home-charity-body section:nth-child(2) strong')).toHaveCount(4);
    await expect(page.locator('#compass-family-services .sf-home-scope')).toContainText('not an unrestricted gift');
    await expect(page.getByRole('link', { name: 'All research', exact:true })).toHaveAttribute('href', 'https://ai.rhyslindmark.com/givebetter/research');
    await expect(page.locator('.sf-home-illustration')).toHaveCount(3);
    await expect(page.locator('#giving-priorities')).toHaveCount(0);
    await page.locator('.sf-home-selection summary').click();
    await expect(page.locator('.sf-home-selection')).toContainText('not fully vetted grant recommendations');
    await expect(page.locator('.sf-home-selection')).toContainText('$10 million');
    const prices=await page.locator('.sf-home-charity-body section:nth-child(2) strong').allTextContents();
    const slugs=await page.locator('.sf-home-charity').evaluateAll(ns=>ns.map(n=>n.id));
    await page.goto('/research');
    for(let i=0;i<slugs.length;i++){
      const value=Number(await page.locator('[data-research-slug="'+slugs[i]+'"]').getAttribute('data-cost-per-ten-qalys'));
      const expected=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6?1:0,maximumFractionDigits:value>=1e6?1:0}).format(value);
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
