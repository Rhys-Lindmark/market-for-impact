import { expect, test } from '@playwright/test';

const defaultRoutes = [
  '/',
  '/india',
  '/san-francisco',
  '/research',
  '/archive',
  '/charities/project-open-hand',
  '/charities/sf-marin-food-bank',
  '/charities/sf-lgbt-center',
  '/charities/compass-family-services',
  '/charities/eviction-defense-collaborative',
  '/charities/farming-hope',
  '/charities/five-keys',
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
  await page.goto('/archive', { waitUntil: 'domcontentloaded' });
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
  await page.goto('/archive', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-mfi-hydrated', 'true');
  await expect(page.locator('.desktop-navigation')).toBeHidden();
  const menu = page.locator('.mobile-menu');
  await expect(menu.locator('summary')).toBeVisible();
  await menu.locator('summary').click();
  await expect(menu.getByRole('link', { name: /Build a portfolio/ })).toBeVisible();
  await expect(menu.getByRole('link', { name: /San Francisco/ })).toBeVisible();
  await menu.getByRole('link', { name: /San Francisco/ }).click();
  await expect(page).toHaveURL(/\/san-francisco$/);
  await expect(page.getByRole('heading', { name: /Our top charities/ })).toBeVisible();
});

test('phone donors can inspect the India geography contract without inferred funding room', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/india', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Giving in India/ })).toBeVisible();
  await expect(page.locator('.india-hero-stats strong')).toHaveText(['50', '1', '0', '0']);
  await expect(page.locator('.india-opportunity-card')).toContainText('Shrimp Welfare Project');
  await expect(page.locator('.india-opportunity-card')).toContainText('India-specific room');
  await expect(page.locator('.india-opportunity-card')).toContainText('Not published');
  await expect(page.locator('.india-flow-summary')).toContainText('Multi-country rows');
  await expect(page.locator('.india-coverage-grid article')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});







test('phone controls retain practical touch targets and wide tables scroll locally', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/archive', { waitUntil: 'domcontentloaded' });
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

  await page.goto('/archive#san-francisco', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.sf-universe-summary strong').first()).not.toHaveText('—', { timeout: 20_000 });
  await expect(page.locator('.sf-irs-summary strong').first()).not.toHaveText('—');
  await expect(page.getByText('The San Francisco candidate universe is temporarily unavailable.')).toHaveCount(0);
  await expect(page.getByText('The IRS identity universe is temporarily unavailable.')).toHaveCount(0);
  for (const apiRoute of routes) expect(attempts.get(apiRoute)).toBeGreaterThanOrEqual(2);
});



test('phone donors can inspect EDC conflicting evidence and its subjective life-bettered conversion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/eviction-defense-collaborative', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'Eviction Defense Collaborative', exact: true })).toBeVisible();
  await expect(review).toContainText('63% of full-scope clients stayed in their homes versus 45%');
  await expect(review).toContainText('not an EDC-specific causal estimate');
  await expect(review).toContainText('did not improve substantive outcomes');
  await expect(review).toContainText('$126,000');
  await expect(review).toContainText('no finite upper bound');
  await expect(review).toContainText('$126M');
  await expect(review).toContainText('explicitly subjective health bridge');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(4);
  await expect(review.locator('.charity-sensitivity article')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Compass C-Rent native and 10-QALY decision models', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/compass-family-services', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'Compass Family Services', exact: true })).toBeVisible();
  await expect(page.getByText('≈ $485K', { exact: true })).toBeVisible();
  await expect(review).toContainText(/\$ per 10 QALYs — one better life/i);
  await expect(page.getByText('≈ $1.35M', { exact: true })).toBeVisible();
  await expect(review).toContainText('about $1.35 million per better life');
  await expect(review).toContainText('$367.68K');
  await expect(review).toContainText('$17.36M');
  await expect(review).toContainText('one adult-equivalent');
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(3);
  await expect(review).toContainText(/no finite upper bound/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Curry model without converting service volume into lives bettered', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/curry-senior-center', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'Curry Senior Center', exact: true })).toBeVisible();
  await expect(review).toContainText('A rich one-year program. Encouraging local change. Very uncertain causal value.');
  await expect(review).toContainText('d=-0.24');
  await expect(review).toContainText('no comparison group');
  await expect(review).toContainText('roughly $170,000 per additional meaningful loneliness improvement');
  await expect(review).toContainText(/\$ per 10 QALYs — one better life/i);
  await expect(page.getByText('≈ $30M', { exact: true })).toBeVisible();
  await expect(review).toContainText('about $30 million per better life');
  await expect(review).toContainText('$1.74M');
  await expect(review).toContainText('$1.6B');
  await expect(review).toContainText('0.0016 QALY');
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(3);
  await expect(review).toContainText(/no finite positive upper bound/i);
  await expect(review).toContainText('null or harmful effect');
  await expect(review).toContainText('not verified room for more funding');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(4);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Food Bank native and 10-QALY decision models without treating food volume as impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/sf-marin-food-bank', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'San Francisco–Marin Food Bank', exact: true })).toBeVisible();
  await expect(review).toContainText('about $6,000 per additional household not experiencing very low food security');
  await expect(review).toContainText('$ per 10 QALYs — one better life');
  await expect(page.getByText('$59.6M', { exact: true }).first()).toBeVisible();
  await expect(review).toContainText('about $59.6 million per10 incremental QALYs');
  await expect(review).toContainText('$515.3K');
  await expect(review).toContainText('$83.5B');
  await expect(review).toContainText('0.000050312499999999996 QALY');
  await expect(review).toContainText('Additional delivery caused by funding');
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(3);
  await expect(review).toContainText(/no finite positive upper bound/i);
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(3);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the SF LGBT Center native and 10-QALY decision models without treating placements as health impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/sf-lgbt-center', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'SF LGBT Center', exact: true })).toBeVisible();
  await expect(review).toContainText('400+ LGBTQ+ job seekers');
  await expect(review).toContainText('30+ people secure living-wage employment');
  await expect(review).toContainText('about $171,768 per additional placement');
  await expect(review).toContainText('null effect remains plausible');
  await expect(review).toContainText(/\$ per 10 QALYs — one better life/i);
  await expect(page.getByText('≈ $168M', { exact: true })).toBeVisible();
  await expect(review).toContainText('about $168 million per better life');
  await expect(review).toContainText('$8.42 million');
  await expect(review).toContainText('$11.2 billion');
  await expect(review).toContainText('0.010204 QALY');
  await expect(review).toContainText('not a causal mediation estimate');
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(3);
  await expect(review).toContainText(/no finite positive upper bound/i);
  await expect(review).toContainText('individualized coaching is paused');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(4);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Farming Hope model without treating placement as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/farming-hope', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'Farming Hope', exact: true })).toBeVisible();
  await expect(review).toContainText('≈ $41.6M');
  await expect(page.getByRole('heading', { name: /about \$41\.6 million per better life/ })).toBeVisible();
  await expect(review).toContainText('71% employment within 90 days of graduation');
  await expect(review).toContainText('about $1.04M per additional person');
  await expect(review).toContainText('did not increase regular unsubsidized employment');
  await expect(review).toContainText('4.0 points');
  await expect(review).toContainText('0.01 QALY');
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(4);
  await expect(review).toContainText('null remains plausible');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(3);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Five Keys model without treating credential or recidivism claims as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/five-keys', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'Five Keys Schools and Programs', exact: true })).toBeVisible();
  await expect(review).toContainText('≈ $167,000');
  await expect(review).toContainText('COST PER BETTER LIFE');
  await expect(review).toContainText('≈ $4.9M');
  await expect(review).toContainText('about $4.9 million per better life');
  await expect(review).toContainText('80% transfer and causal discount');
  await expect(review).toContainText('$ per 10 QALYs — one better life');
  await expect(review).toContainText('decision scenarios, not confidence bounds');
  await expect(review).toContainText('zero remains plausible');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(3);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the GLIDE rental-assistance model without treating retention as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/glide', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'GLIDE Foundation', exact: true })).toBeVisible();
  await expect(review).toContainText('A concrete prevention tool. A credible outside study. A very uncertain GLIDE effect.');
  await expect(review).toContainText('$100,000 rental-assistance cohort served 39 households');
  await expect(review).toContainText('roughly $154,000 per additional six-month shelter entry averted');
  await expect(review).toContainText('1.6 percentage points');
  await expect(review).toContainText('null effect remains plausible');
  await expect(review).toContainText(/\$ per 10 QALYs — one better life/i);
  await expect(page.getByText('≈ $427K', { exact: true })).toBeVisible();
  await expect(review).toContainText('about $427,000 per better life');
  await expect(review).toContainText('$178.06K');
  await expect(review).toContainText('$3.47M');
  await expect(review).toContainText('one adult-equivalent');
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(3);
  await expect(review).toContainText(/no finite upper bound/i);
  await expect(review).toContainText('not verified room for more funding');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(3);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Hamilton prevention model without treating reported avoidance as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/hamilton-families', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'Hamilton Families', exact: true })).toBeVisible();
  await expect(review).toContainText('Strong evidence for the intervention. Weak evidence for Hamilton’s next dollar.');
  await expect(review).toContainText('3.8 percentage points within six months');
  await expect(review).toContainText('roughly $500,000 per additional six-month homelessness episode averted');
  await expect(review).toContainText('The 127 reported FY2025 families remain an output, not a causal denominator');
  await expect(review).toContainText('null effect remains plausible');
  await expect(review).toContainText('$ per 10 QALYs — one better life');
  await expect(review).toContainText('≈ $1.4M');
  await expect(review).toContainText('about $1.4 million per better life');
  await expect(review).toContainText('$347.2K');
  await expect(review).toContainText('$17.4M');
  await expect(review).toContainText('one adult-equivalent beneficiary');
  await expect(review).toContainText('no finite upper bound');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(3);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});




test('phone donors can inspect the Institute on Aging review without treating calls as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/charities/institute-on-aging', { waitUntil: 'domcontentloaded' });
  const review = page.locator('.charity-report-article');
  await expect(page.getByRole('heading', { level: 1, name: 'Institute on Aging', exact: true })).toBeVisible();
  await expect(review).toContainText('Promising human connection. A weak causal record.');
  await expect(review).toContainText('Calls are not unique participants');
  await expect(review).toContainText('no concurrent control group');
  await expect(review).toContainText('self-selected rather than assigned');
  await expect(review).toContainText('Not published');
  await expect(review).toContainText('roughly $15,000 per six-month loneliness remission');
  await expect(review).toContainText(/cost per better life/i);
  await expect(page.getByText('≈ $14.9M', { exact: true })).toBeVisible();
  await expect(review).toContainText('about $14.9 million per better life');
  await expect(review).toContainText('$1.25M');
  await expect(review).toContainText('$624M');
  await expect(review).toContainText('0.0007 QALY');
  await expect(review.locator('.charity-qaly-bridge .charity-sensitivity article')).toHaveCount(3);
  await expect(review).toContainText(/no finite positive upper bound/i);
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(5);
  await expect(review.locator('.charity-model > .charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
