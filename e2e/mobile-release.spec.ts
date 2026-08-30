import { expect, test } from '@playwright/test';

const routes = (process.env.MOBILE_AUDIT_ROUTES ?? '/,/san-francisco').split(',').map((route) => route.trim()).filter(Boolean);

for (const route of routes) {
  test(`${route} has no page-level horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('phone donors can reach the core market from the top bar', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-mfi-hydrated', 'true');
  await expect(page.locator('.desktop-navigation')).toBeHidden();
  const menu = page.locator('.mobile-menu');
  await expect(menu.locator('summary')).toBeVisible();
  await menu.locator('summary').click();
  await expect(menu.getByRole('link', { name: /Build a portfolio/ })).toBeVisible();
  await expect(menu.getByRole('link', { name: /San Francisco/ })).toBeVisible();
  await menu.getByRole('link', { name: /San Francisco/ }).click();
  await expect(page).toHaveURL(/\/san-francisco$/);
  await expect(page.getByRole('heading', { name: /Where can a major gift do the most good/ })).toBeVisible();
});

test('phone donors can inspect a San Francisco diligence record', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#diligence', { waitUntil: 'domcontentloaded' });
  const firstRecord = page.locator('.sf-brief-candidates details').first();
  await firstRecord.locator('summary').click();
  await expect(firstRecord).toHaveAttribute('open', '');
  await expect(firstRecord.getByText('Causal boundary')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can distinguish reported outcomes from external evidence dossiers', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#diligence', { waitUntil: 'domcontentloaded' });
  const dossiers = page.locator('.sf-evidence-dossier');
  await expect(dossiers).toHaveCount(2);
  const hamilton = dossiers.filter({ hasText: 'Hamilton Families' });
  await expect(hamilton.getByText('deeper diligence; recommendation blocked')).toBeVisible();
  await expect(hamilton.getByText('results pending')).toBeVisible();
  const foodBank = dossiers.filter({ hasText: 'San Francisco–Marin Food Bank' });
  await expect(foodBank.getByRole('heading', { name: /What the Food Bank says happened/ })).toBeVisible();
  await expect(foodBank.getByText('randomized trial; 228 adults followed for 12 months')).toBeVisible();
  await expect(foodBank.getByText('03 · What still blocks a recommendation')).toBeVisible();
  await expect(foodBank.getByRole('heading', { name: /price the next dollar/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone controls retain practical touch targets and wide tables scroll locally', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const undersizedButtons = await page.locator('button:visible').evaluateAll((buttons) => buttons
    .map((button) => ({ label: button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '', height: button.getBoundingClientRect().height }))
    .filter((button) => button.height < 43.5));
  expect(undersizedButtons).toEqual([]);
  const table = page.locator('.cause-candidate-table');
  await expect(table).toBeVisible();
  expect(await table.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('transient San Francisco discovery-feed failures recover without permanent error panels', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  const attempts = new Map<string, number>();
  const routes = [
    '/api/sf-candidate-universe',
    '/api/sf-irs-universe',
  ];

  for (const apiRoute of routes) {
    await page.route(`**${apiRoute}*`, async (route) => {
      const attempt = (attempts.get(apiRoute) ?? 0) + 1;
      attempts.set(apiRoute, attempt);
      if (attempt === 1) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Simulated transient failure' }),
        });
        return;
      }
      await route.continue();
    });
  }

  await page.goto('/#san-francisco', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.sf-universe-summary strong').first()).not.toHaveText('—', { timeout: 20_000 });
  await expect(page.locator('.sf-irs-summary strong').first()).not.toHaveText('—');
  await expect(page.getByText('The San Francisco candidate universe is temporarily unavailable.')).toHaveCount(0);
  await expect(page.getByText('The IRS identity universe is temporarily unavailable.')).toHaveCount(0);
  for (const apiRoute of routes) expect(attempts.get(apiRoute)).toBeGreaterThanOrEqual(2);
});
