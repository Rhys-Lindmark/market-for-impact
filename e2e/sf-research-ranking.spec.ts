import { expect, test } from '@playwright/test';

test('research list is numeric ascending and its first four match the home page', async ({ page }) => {
  await page.goto('/research');
  const cards = page.locator('[data-research-slug]');
  await expect(cards).toHaveCount(31);
  const rows = await cards.evaluateAll(nodes => nodes.map(n => ({ slug: n.getAttribute('data-research-slug'), cost: Number(n.getAttribute('data-cost-per-ten-qalys')) })));
  expect(rows.every((r, i) => Number.isFinite(r.cost) && (i === 0 || r.cost >= rows[i - 1].cost))).toBe(true);
  expect(new Set(rows.map(r => r.slug)).size).toBe(31);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/');
  expect(await page.locator('.sf-home-charity').evaluateAll(nodes => nodes.map(n => n.id))).toEqual(rows.slice(0, 4).map(r => r.slug));
});
