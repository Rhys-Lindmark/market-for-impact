import { expect, test } from '@playwright/test';

const defaultRoutes = [
  '/',
  '/india',
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

test('phone donors reach the complete San Francisco decision state before the research archive', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#decision-snapshot', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'What can a donor act on today?' })).toBeVisible();
  await expect(page.locator('.sf-decision-answer>strong')).toHaveText('0');
  const rows = page.locator('.sf-decision-row');
  await expect(rows).toHaveCount(6);
  await expect(rows.locator('div:first-child>strong')).toHaveText(['GLIDE', 'GrowSF', 'Hamilton Families', 'Housing Action Coalition', 'San Francisco–Marin Food Bank', 'SF LGBT Center']);
  await expect(rows.locator('.missing').filter({ hasText: 'Impact price' }).locator('strong')).toHaveText(Array(6).fill('Not yet estimable'));
  await expect(rows.locator('.missing').filter({ hasText: 'Marginal gap' }).locator('strong')).toHaveText(Array(6).fill('Not published'));
  await expect(page.getByText('Why there is no “top charity” yet.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can search the complete SFF community-foundation partner lens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#community-foundation', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Another 424 doors into the local field.' })).toBeVisible();
  await expect(page.locator('.sf-sff-summary strong')).toHaveText(['424', '$49.52M', '11', '1', '1', '0']);
  await expect(page.locator('.sf-sff-grid article')).toHaveCount(12);
  await page.getByLabel('Search SFF FY2025 partners').fill('Hamilton Families');
  await expect(page.locator('.sf-sff-grid article')).toHaveCount(1);
  const hamilton = page.locator('.sf-sff-grid article').first();
  await expect(hamilton).toContainText('Hamilton Families');
  await expect(hamilton).toContainText('$15,000');
  await expect(hamilton).toContainText('One partner total—not an individual grant or current funding gap');
  await expect(hamilton.getByRole('link', { name: 'Open deep evidence dossier' })).toBeVisible();
  await page.getByLabel('Search SFF FY2025 partners').fill('Independent Arts & Media');
  await expect(page.locator('.sf-sff-grid article')).toHaveCount(1);
  const eltimpano = page.locator('.sf-sff-grid article').first();
  await expect(eltimpano).toContainText('El Tímpano');
  await expect(eltimpano).toContainText('historical source assertion, not current verification');
  await expect(eltimpano).toContainText('historical sponsor changed');
  await expect(eltimpano).toContainText('Mission Edge');
  await expect(eltimpano).toContainText('explicit audience presence within regional scope');
  await expect(eltimpano).toContainText('more than 100 San Francisco subscribers');
  await expect(eltimpano).toContainText('Screened · recommendation blocked');
  await expect(eltimpano).toContainText('5,500+ · SMS subscriber community');
  await expect(eltimpano).toContainText('project level financials not published in reviewed sources');
  await expect(eltimpano).toContainText('Funding room · Not yet estimable');
  await expect(eltimpano.getByRole('link', { name: /Community-Centered Outlets Empower and Inform Latinos/ })).toBeVisible();
  await expect(eltimpano.getByRole('link', { name: 'Current donation route' })).toBeVisible();
  await expect(eltimpano.getByRole('link', { name: 'Independent Arts & Media' })).toBeVisible();
  await page.getByLabel('Search SFF FY2025 partners').fill('');
  await page.getByLabel('Filter SFF identity links').selectOption('diligence-screened');
  await expect(page.locator('.sf-sff-grid article')).toHaveCount(1);
  await expect(page.locator('.sf-sff-grid article').first()).toContainText('El Tímpano');
  await page.getByLabel('Filter SFF identity links').selectOption('current-unresolved');
  await expect(page.locator('.sf-sff-grid article')).toHaveCount(5);
  await expect(page.locator('.sf-sff-grid article')).toContainText(['Bay Resistance Institute', 'California Native Vote Project', 'Cooperation Richmond', 'Lavender Phoenix', 'Palestinian Youth Movement']);
  await page.getByLabel('Filter SFF identity links').selectOption('geography-non-sf-local');
  await expect(page.locator('.sf-sff-grid article')).toHaveCount(4);
  await expect(page.locator('.sf-sff-grid article')).toContainText(['Cooperation Richmond', 'Lift Up Contra Costa', 'Oakland Rising', 'Rising Juntos']);
  await page.getByLabel('Search SFF FY2025 partners').fill('Asian Prisoner Support Committee');
  await page.getByLabel('Filter SFF identity links').selectOption('current-changed');
  await expect(page.locator('.sf-sff-grid article')).toHaveCount(1);
  await expect(page.locator('.sf-sff-grid article').first()).toContainText('Asian Americans for Civil Rights and Equality (AACRE)');
  await expect(page.getByText('The community-foundation explorer could not refresh.')).toHaveCount(0);
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
  await expect(page.locator('.sf-request-index a')).toHaveCount(6);
  const requests = page.locator('.sf-request-packet');
  await expect(requests).toHaveCount(6);
  const hamiltonRequest = requests.filter({ hasText: 'What could Hamilton Families do with the next gift?' });
  const foodBankRequest = requests.filter({ hasText: 'What could the Food Bank do with the next gift?' });
  const centerRequest = requests.filter({ hasText: 'What could the SF LGBT Center do with the next gift?' });
  const glideRequest = requests.filter({ hasText: 'What could GLIDE do with the next gift?' });
  const hacRequest = requests.filter({ hasText: 'What could Housing Action Coalition do with the next gift?' });
  const growsfRequest = requests.filter({ hasText: 'What could GrowSF do with the next gift?' });
  for (const request of [hamiltonRequest, foodBankRequest, centerRequest, glideRequest, hacRequest, growsfRequest]) {
    await expect(request.getByText('Draft · not sent')).toBeVisible();
    await expect(request.locator('.sf-request-facts article')).toHaveCount(5);
    await expect(request.locator('.sf-request-scenarios article')).toHaveCount(3);
    await expect(request.locator('.sf-request-scenarios article>header strong')).toHaveText(['$100K', '$1M', '$10M']);
    await expect(request.locator('.sf-request-questions>ol>li')).toHaveCount(8);
    await expect(request.getByText('not-submitted', { exact: true })).toHaveCount(11);
    await expect(request.getByText('not-started', { exact: true })).toHaveCount(8);
  }
  await expect(growsfRequest).toContainText('not a funding recommendation');
  await expect(growsfRequest).toContainText('political endorsement');
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
  await expect(hacRequest).toContainText('4,500+ units reported legally enabled');
  await expect(hacRequest).toContainText('$120K Coefficient-published 2025 advocacy grant');
  await expect(hacRequest).toContainText('140 member organizations');
  await expect(hacRequest).toContainText('permits, starts, completions and occupancy');
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
  await expect(dossiers).toHaveCount(6);
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
  const growsf = dossiers.filter({ hasText: 'GrowSF' });
  await expect(growsf.getByRole('heading', { name: /What Coalition to Grow San Francisco – GrowSF says happened/ })).toBeVisible();
  await expect(growsf.getByText('official final election canvass')).toBeVisible();
  await expect(growsf.getByText('meta-analysis of 40 field experiments plus nine original field experiments')).toBeVisible();
  await expect(growsf.getByText('03 · What still blocks a recommendation')).toBeVisible();
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

test('phone donors can inspect the 6,688 to 25 San Francisco research funnel', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#research-funnel', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '6,688 records. 25 deep reviews.' })).toBeVisible();
  await expect(page.locator('.sf-research-stages strong')).toHaveText(['6,688', '1,000', '100', '25', '4']);
  await expect(page.locator('.sf-deep-queue article')).toHaveCount(25);
  await expect(page.locator('.sf-deep-queue article>b').filter({ hasText: 'CEA not started' })).toHaveCount(13);
  await expect(page.locator('.sf-deep-queue article>b').filter({ hasText: 'Initial review complete' })).toHaveCount(8);
  await expect(page.locator('.sf-deep-queue article>b').filter({ hasText: 'Exploratory model' })).toHaveCount(3);
  await expect(page.locator('.sf-advocacy-track')).toContainText('GrowSF');
  await expect(page.locator('.sf-advocacy-track')).toContainText('Advocacy is reviewed, not ranked.');
  await expect(page.getByRole('link', { name: /Open the SF cost-effectiveness workbook/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the first San Francisco deep review without a fabricated CEA', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#project-open-hand-review', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 2, name: 'Project Open Hand', exact: true })).toBeVisible();
  await expect(page.locator('#project-open-hand-review')).toContainText('Direct trial involvement. Mixed results.');
  await expect(page.locator('#project-open-hand-review')).toContainText('The primary all-cause 90-day readmission outcome was not improved');
  await expect(page.locator('#project-open-hand-review')).toContainText('Not estimable');
  await expect(page.locator('#project-open-hand-review')).toContainText('Not published');
  await expect(page.locator('#project-open-hand-review .sf-deep-evidence article')).toHaveCount(3);
  await expect(page.locator('#project-open-hand-review .sf-deep-model li')).toHaveCount(11);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the EDC review without a fabricated causal estimate', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#eviction-defense-collaborative-review', { waitUntil: 'domcontentloaded' });
  const review = page.locator('#eviction-defense-collaborative-review');
  await expect(page.getByRole('heading', { level: 2, name: 'Eviction Defense Collaborative', exact: true })).toBeVisible();
  await expect(review).toContainText('63% of full-scope clients stayed in their homes versus 45%');
  await expect(review).toContainText('not an EDC-specific causal estimate');
  await expect(review).toContainText('did not improve substantive outcomes');
  await expect(review).toContainText('Not estimable');
  await expect(review.locator('.sf-deep-evidence article')).toHaveCount(3);
  await expect(review.locator('.sf-deep-model li')).toHaveCount(14);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Compass review without a fabricated housing impact price', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#compass-family-services-review', { waitUntil: 'domcontentloaded' });
  const review = page.locator('#compass-family-services-review');
  await expect(page.getByRole('heading', { level: 2, name: 'Compass Family Services', exact: true })).toBeVisible();
  await expect(review).toContainText('Strong need. Mixed evidence. Better measurement underway.');
  await expect(review).toContainText('roughly the same outcomes as usual care');
  await expect(review).toContainText('results are not yet published');
  await expect(review).toContainText('Not estimable');
  await expect(review.locator('.sf-deep-evidence article')).toHaveCount(3);
  await expect(review.locator('.sf-deep-model li')).toHaveCount(15);
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
  await expect(review).toContainText('null or harmful effect');
  await expect(review).toContainText('not verified room for more funding');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(4);
  await expect(review.locator('.charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Farming Hope review without treating placement as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#farming-hope-review', { waitUntil: 'domcontentloaded' });
  const review = page.locator('#farming-hope-review');
  await expect(page.getByRole('heading', { level: 2, name: 'Farming Hope', exact: true })).toBeVisible();
  await expect(review).toContainText('Promising placement signal. Mixed transferred evidence.');
  await expect(review).toContainText('did not increase regular unsubsidized employment');
  await expect(review).toContainText('4.0 percentage-point impact');
  await expect(review).toContainText('Not estimable');
  await expect(review.locator('.sf-deep-evidence article')).toHaveCount(3);
  await expect(review.locator('.sf-deep-model li')).toHaveCount(15);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Five Keys review without treating recidivism claims as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#five-keys-review', { waitUntil: 'domcontentloaded' });
  const review = page.locator('#five-keys-review');
  await expect(page.getByRole('heading', { level: 2, name: 'Five Keys Schools and Programs', exact: true })).toBeVisible();
  await expect(review).toContainText('Promising intervention class. Local causal effect unknown.');
  await expect(review).toContainText('cannot be interpreted as a Five Keys causal reduction');
  await expect(review).toContainText("not Five Keys' effect size");
  await expect(review).toContainText('Not estimable');
  await expect(review.locator('.sf-deep-evidence article')).toHaveCount(3);
  await expect(review.locator('.sf-deep-model li')).toHaveCount(15);
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
  await expect(review).toContainText('not verified room for more funding');
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(3);
  await expect(review.locator('.charity-sensitivity article')).toHaveCount(3);
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
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(3);
  await expect(review.locator('.charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the HRTC review without treating service contacts as causal impact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#harm-reduction-therapy-center-review', { waitUntil: 'domcontentloaded' });
  const review = page.locator('#harm-reduction-therapy-center-review');
  await expect(page.getByRole('heading', { level: 2, name: 'Harm Reduction Therapy Center', exact: true })).toBeVisible();
  await expect(review).toContainText('Relevant short-term trial. HRTC effect unknown.');
  await expect(review).toContainText('not unique participants, completed treatment courses, durable outcomes');
  await expect(review).toContainText("not HRTC's effect size");
  await expect(review).toContainText('no statistically significant treatment-group differences');
  await expect(review).toContainText('Not estimable');
  await expect(review.locator('.sf-deep-evidence article')).toHaveCount(5);
  await expect(review.locator('.sf-deep-model li')).toHaveCount(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the HYA review without treating referrals as durable outcomes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#homeless-youth-alliance-review', { waitUntil: 'domcontentloaded' });
  const review = page.locator('#homeless-youth-alliance-review');
  await expect(page.getByRole('heading', { level: 2, name: 'Homeless Youth Alliance', exact: true })).toBeVisible();
  await expect(review).toContainText('Strong intervention rationale. HYA effect unknown.');
  await expect(review).toContainText('not verified enrollment, completion, sustained housing');
  await expect(review).toContainText('supports the intervention class, not HYA');
  await expect(review).toContainText('connection to housing is not equivalent');
  await expect(review).toContainText('Not estimable');
  await expect(review.locator('.sf-deep-evidence article')).toHaveCount(5);
  await expect(review.locator('.sf-deep-model li')).toHaveCount(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('phone donors can inspect the Huckleberry review without pooling unlike outcomes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390');
  await page.goto('/san-francisco#huckleberry-youth-programs-review', { waitUntil: 'domcontentloaded' });
  const review = page.locator('#huckleberry-youth-programs-review');
  await expect(page.getByRole('heading', { level: 2, name: 'Huckleberry Youth Programs', exact: true })).toBeVisible();
  await expect(review).toContainText('Several promising pathways. No single marginal case.');
  await expect(review).toContainText('different denominators and conditioning rules');
  await expect(review).toContainText('nonexperimental participant-only design');
  await expect(review).toContainText('supports the intervention class for low-risk youth, not CARC');
  await expect(review).toContainText('Not estimable');
  await expect(review.locator('.sf-deep-evidence article')).toHaveCount(5);
  await expect(review.locator('.sf-deep-model li')).toHaveCount(16);
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
  await expect(review.locator('.charity-evidence-list article')).toHaveCount(5);
  await expect(review.locator('.charity-sensitivity article')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
