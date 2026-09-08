import { test, expect } from '@playwright/test';

test('concise index has qualified estimates and no retired navigation', async ({ page }) => {
  await page.goto('/research');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('GiveBetter x SF Research');
  await expect(page.locator('body')).toContainText('not verified donation offers');
  await expect(page.locator('body')).toContainText('SF-resident QALYs');
  await expect(page.locator('[data-research-slug]')).toHaveCount(51);
  await expect(page.locator('.sf-deep-queue, .sf-decision-snapshot, .sf-evidence-dossier, .sf-comparison-card')).toHaveCount(0);
  const dead = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(a => !document.getElementById(a.getAttribute('href')!.slice(1))).map(a => a.getAttribute('href')));
  expect(dead).toEqual([]);
  for (const slug of ['san-francisco-aids-foundation', 'huckleberry-youth-programs', 'community-forward-sf', 'brightline-defense', 'rebuilding-together-sf']) {
    await page.locator(`[data-research-slug="${slug}"] a`).first().click();
    await expect(page).toHaveURL(new RegExp('/charities/' + slug + '$'));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('body')).toContainText('QALY');
    await page.goto('/research');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('historical SFF source remains queryable without becoming a donation offer', async ({ request }) => {
  const r = await request.get('/api/sf-sff-grants?q=Hamilton%20Families');
  expect(r.ok()).toBe(true);
  const data = await r.json();
  expect(data.pagination.total).toBe(1);
  expect(data.partners[0].granteeName).toBe('Hamilton Families');
  expect(data.partners[0].totalFundingUsd).toBe(15000);
  expect(data.summary.publishedPartnerTotalFundingUsd).toBeGreaterThan(0);
  const paged = await request.get('/api/sf-sff-grants?pageSize=12&page=2');
  const j = await paged.json();
  expect(j.pagination.total).toBe(424);
  expect(j.partners).toHaveLength(12);
  expect(j.pagination.page).toBe(2);
});

for (const [slug, caveats] of [
  ['project-open-hand', ['did not reduce the primary outcome', 'exploratory', '90-day', 'short-term']],
  ['harm-reduction-therapy-center', ['not executed costs, completed courses or causal outcomes', 'Quality-of-life differences were inconclusive', 'not a measured HRTC result']],
  ['homeless-youth-alliance', ['referral counts alone do not demonstrate medication access', 'Prime-only ledgers miss subcontract exposure', 'donor-budget model rather than a societal ICER']],
] as const) {
  test(`${slug} retains causal evidence on its dedicated report`, async ({ page }) => {
    await page.goto('/charities/' + slug);
    for (const text of caveats) await expect(page.locator('body')).toContainText(text);
    await expect(page.locator('#sources a')).not.toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
