import { expect, test } from '@playwright/test';

const defaultRoutes = [
  '/',
  '/san-francisco',
  '/grants/coefficient/grants-18659-0',
  '/grants/coefficient/grants-15086-0',
  '/organizations/georgetown-university-initiative-on-innovation-development-and-evaluation',
];
const routes = (process.env.MOBILE_AUDIT_ROUTES?.split(',') ?? defaultRoutes).map((route) => route.trim()).filter(Boolean);

for (const route of routes) {
  test(`${route} has no page-level horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('This page couldn’t load')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('phone donors can use critical evidence controls without silent panel failures', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-mfi-hydrated', 'true');

  await expect(page.locator('.ai-safety-overview strong').first()).not.toHaveText('—', { timeout: 20_000 });
  await expect(page.locator('.quality-summary-grid strong').first()).not.toHaveText('—');
  await expect(page.getByText('The AI safety ecosystem is temporarily unavailable.')).toHaveCount(0);
  await expect(page.getByText('The quality register is temporarily unavailable.')).toHaveCount(0);

  await page.getByLabel('Uncertainty tolerance').selectOption('exploratory');
  await expect(page.getByLabel('Uncertainty tolerance')).toHaveValue('exploratory');

  const climateTab = page.locator('.comparison-cause-tabs').getByRole('tab', { name: /Climate/ });
  await climateTab.click();
  await expect(climateTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.comparison-summary')).toContainText('Climate');

  const unpublishedTab = page.locator('.funding-curve-controls').getByRole('tab', { name: 'Amount unpublished' });
  await unpublishedTab.click();
  await expect(unpublishedTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.funding-curve-readout')).toContainText('OPEN OR LIVE, AMOUNT NOT PUBLISHED');

  await page.locator('.flow-ledger-tabs button').filter({ hasText: 'Giving Green' }).click();
  await expect(page.locator('.flow-query-status')).toContainText(/matching Giving Green.* rows/);

  const qualityState = page.locator('.quality-filter-controls label').nth(1).locator('select');
  await qualityState.selectOption('conflict');
  await expect(qualityState).toHaveValue('conflict');
  await expect(page.locator('.quality-issue-grid')).toContainText('source conflict');

  await page.getByLabel('Search San Francisco IRS exempt organizations').fill('GLIDE');
  await expect(page.locator('.sf-irs-grid')).toContainText('GLIDE');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

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

test('phone donors see the same honest decision fields across all six San Francisco candidates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#comparison', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Six organizations. One honest denominator.' })).toBeVisible();
  const cards = page.locator('.sf-comparison-card');
  await expect(cards).toHaveCount(6);
  await expect(cards.locator('.sf-comparison-cost')).toHaveCount(6);
  await expect(cards.locator('.sf-comparison-cost')).toHaveText(Array(6).fill('Not yet estimable'));
  await expect(page.locator('.sf-comparison-summary>div').nth(1)).toContainText('Recommendation-ready');
  await expect(page.locator('.sf-comparison-summary>div').nth(1).locator('strong')).toHaveText('0');
  const firstCard = cards.first();
  await expect(firstCard.locator('.sf-comparison-gifts')).toContainText('$100K');
  await expect(firstCard.locator('.sf-comparison-gifts')).toContainText('$1M');
  await expect(firstCard.locator('.sf-comparison-gifts')).toContainText('$10M');
  await expect(firstCard.locator('.sf-comparison-gifts')).toContainText('No reviewed plan');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the marginal-plan and grant-look-back research contract', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#protocol', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'How an impact number earns its place.' })).toBeVisible();
  const summary = page.locator('.sf-protocol-summary');
  await expect(summary.locator('strong')).toHaveText(['18', '0', '0', '0']);
  await expect(page.locator('.sf-protocol-contract>section')).toHaveCount(2);
  await expect(page.locator('.sf-protocol-contract li')).toHaveCount(16);
  await expect(page.locator('.sf-request-index a')).toHaveCount(4);
  const requests = page.locator('.sf-request-packet');
  await expect(requests).toHaveCount(4);
  const hamiltonRequest = requests.filter({ hasText: 'What could Hamilton Families do with the next gift?' });
  const foodBankRequest = requests.filter({ hasText: 'What could the Food Bank do with the next gift?' });
  const centerRequest = requests.filter({ hasText: 'What could the SF LGBT Center do with the next gift?' });
  const glideRequest = requests.filter({ hasText: 'What could GLIDE do with the next gift?' });
  for (const request of [hamiltonRequest, foodBankRequest, centerRequest, glideRequest]) {
    await expect(request.getByText('Draft · not sent')).toBeVisible();
    await expect(request.locator('.sf-request-facts article')).toHaveCount(5);
    await expect(request.locator('.sf-request-scenarios article')).toHaveCount(3);
    await expect(request.locator('.sf-request-scenarios article>header strong')).toHaveText(['$100K', '$1M', '$10M']);
    await expect(request.locator('.sf-request-questions>ol>li')).toHaveCount(8);
    await expect(request.getByText('not-submitted', { exact: true })).toHaveCount(11);
    await expect(request.getByText('not-started', { exact: true })).toHaveCount(8);
  }
  await expect(hamiltonRequest).toContainText('8 exact prime-contractor matches');
  await expect(foodBankRequest).toContainText('at capacity and uses a waitlist');
  await expect(foodBankRequest).toContainText('$83.89M donated food/in-kind');
  await expect(foodBankRequest).toContainText('USDA food-security denominator');
  await expect(centerRequest).toContainText('5 exact prime-contractor matches');
  await expect(centerRequest).toContainText('enrollment is currently paused');
  await expect(centerRequest).toContainText('248-participant formative evaluation');
  await expect(centerRequest).toContainText(/cost per retained living-wage job/i);
  await expect(glideRequest).toContainText('14 exact prime-contractor matches');
  await expect(glideRequest).toContainText('620,513 meals served');
  await expect(glideRequest).toContainText('limited space and high demand');
  await expect(glideRequest).toContainText('$14.12M future meal agreement');
  const seed = page.locator('.sf-lookback-seed article');
  await expect(seed).toHaveCount(1);
  await expect(seed).toContainText('$120K');
  await expect(seed).toContainText('Housing Action Coalition');
  await expect(seed).toContainText('not-published');
  await expect(seed).toContainText('not-yet-assessable');
  const queue = page.locator('.sf-protocol-queue article');
  await expect(queue).toHaveCount(6);
  await expect(queue.locator('header b')).toHaveText(Array(6).fill('Not submitted'));
  await expect(queue.first()).toContainText('$100K');
  await expect(queue.first()).toContainText('$1M');
  await expect(queue.first()).toContainText('$10M');
  await expect(queue.first()).toContainText('Awaiting program-specific plan');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
  await expect(dossiers).toHaveCount(5);
  const hamilton = dossiers.filter({ hasText: 'Hamilton Families' });
  await expect(hamilton.getByText('deeper diligence; recommendation blocked')).toBeVisible();
  await expect(hamilton.getByText('results pending')).toBeVisible();
  const foodBank = dossiers.filter({ hasText: 'San Francisco–Marin Food Bank' });
  await expect(foodBank.getByRole('heading', { name: /What the Food Bank says happened/ })).toBeVisible();
  await expect(foodBank.getByText('randomized trial; 228 adults followed for 12 months')).toBeVisible();
  await expect(foodBank.getByText('03 · What still blocks a recommendation')).toBeVisible();
  await expect(foodBank.getByRole('heading', { name: /price the next dollar/ })).toBeVisible();
  const center = dossiers.filter({ hasText: 'SF LGBT Center' });
  await expect(center.getByRole('heading', { name: /What the Center says happened/ })).toBeVisible();
  await expect(center.getByText('systematic review of 107 experimental or quasi-experimental interventions in 31 countries')).toBeVisible();
  await expect(center.getByText('03 · What still blocks a recommendation')).toBeVisible();
  const glide = dossiers.filter({ hasText: 'GLIDE' });
  await expect(glide.getByRole('heading', { name: /What GLIDE says happened/ })).toBeVisible();
  await expect(glide.getByText('systematic review and meta-analysis of 74 randomized clinical trials with 10,444 adults')).toBeVisible();
  await expect(glide.getByText('03 · What still blocks a recommendation')).toBeVisible();
  const hac = dossiers.filter({ hasText: 'Housing Action Coalition' });
  await expect(hac.getByRole('heading', { name: /What Housing Action Coalition says happened/ })).toBeVisible();
  await expect(hac.getByText('official bill history and chapter status')).toBeVisible();
  await expect(hac.getByText('peer-reviewed literature review of zoning change, construction, costs, and neighborhood demographics')).toBeVisible();
  await expect(hac.getByText('03 · What still blocks a recommendation')).toBeVisible();
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
