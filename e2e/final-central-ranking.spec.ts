import { test, expect } from '@playwright/test';
import { centralBayAdapters } from '../lib/central-bay-adapters.mjs';

test('central Bay prices reconcile across directory and homepage', async ({ page, request }) => {
  await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**', async route => {
    const u = new URL(route.request().url());
    await route.fulfill({ response: await request.get(u.pathname + u.search) });
  });
  await page.goto('/research');
  for (const [slug, estimate] of Object.entries(centralBayAdapters)) {
    await expect(page.locator(`[data-research-slug="${slug}"]`)).toHaveAttribute('data-cost-per-ten-qalys', String(estimate.bayUsdPerTenQalys));
  }
  const ranked = await page.locator('[data-research-slug][data-cost-per-ten-qalys]').evaluateAll(rows => rows.map(row => ({ slug: row.getAttribute('data-research-slug'), cost: Number(row.getAttribute('data-cost-per-ten-qalys')) })).filter(row => row.cost > 0));
  expect(ranked.map(row => row.cost)).toEqual([...ranked].sort((a,b) => a.cost-b.cost).map(row => row.cost));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  expect(await page.locator('article.sf-home-charity').evaluateAll(rows => rows.map(row => row.id))).toEqual(ranked.slice(0,4).map(row => row.slug));
  await expect(page.getByText('Ten priorities for giving', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
