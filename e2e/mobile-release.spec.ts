import { expect, test } from '@playwright/test';

const routes = (process.env.MOBILE_AUDIT_ROUTES ?? '/').split(',').map((route) => route.trim()).filter(Boolean);

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
  await expect(page).toHaveURL(/#san-francisco$/);
  await expect(menu).not.toHaveAttribute('open', '');
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
