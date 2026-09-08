import { expect, test } from '@playwright/test';

test('research list is numeric ascending and its first four match the home page', async ({ page }) => {
  await page.goto('/research');
  const cards = page.locator('[data-research-slug]');
  await expect(cards).toHaveCount(49);
  const rows = await cards.evaluateAll(nodes => nodes.map(n => ({ slug: n.getAttribute('data-research-slug'), cost: n.hasAttribute('data-cost-per-ten-qalys') ? Number(n.getAttribute('data-cost-per-ten-qalys')) : Infinity })));
  expect(rows.every((r, i) => (i === 0 || r.cost >= rows[i - 1].cost))).toBe(true);
  expect(new Set(rows.map(r => r.slug)).size).toBe(49);
  await expect(page.getByText('THE FIRST 25', { exact: false })).toHaveCount(0);
  await expect(page.locator('.sf-deep-queue, .sf-evidence-dossier, .sf-decision-snapshot')).toHaveCount(0);
  await expect(page.locator('#top-research tbody tr')).toHaveCount(49);
  for (const row of rows) {
    await expect(page.locator(`[data-research-slug="${row.slug}"] a`).first()).toHaveAttribute('href', `/charities/${row.slug}`);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/');
  expect(await page.locator('.sf-home-charity').evaluateAll(nodes => nodes.map(n => n.id))).toEqual(rows.slice(0, 4).map(r => r.slug));
});
