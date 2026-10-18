import {test, expect} from '@playwright/test';

test('Youth ALIVE report, income-aware API and California list agree', async ({page, request}) => {
  await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**', async route => {
    const u = new URL(route.request().url());
    await route.fulfill({response:await request.get(u.pathname + u.search)});
  });
  await page.goto('/california/charities/youth-alive');
  await expect(page.getByRole('heading', {level:1, name:'Youth ALIVE!', exact:true})).toBeVisible();
  await expect(page.locator('.report-research-effort summary')).toContainText('GPT-6.1 Sol');
  await expect(page.locator('#summary')).toContainText('$476.4M');
  await expect(page.locator('#cost')).toContainText('Income and overlap');
  await expect(page.locator('#cost')).toContainText('$27,335,578');
  await expect(page.locator('#cost')).toContainText('partial-portfolio');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const response = await request.get('/api/geography-reports/california/youth-alive');
  expect(response.ok()).toBe(true);
  const d = await response.json(), c = d.model.scenarios.find((s:{id:string}) => s.id === 'central');
  expect(c.editionQalys).toBeCloseTo(.0014316240019768853, 12);
  const income = c.incomePathways.reduce((sum:number, p:any) => {
    let years = 0;
    for (let i = 0; i < Math.ceil(p.years); i++) years += Math.min(1, p.years - i) / (1 + p.discountRate) ** (p.delayYears + i);
    return sum + .5 * p.people * Math.log1p(p.annualIncomeGainUSD / p.annualIncomeBeforeUSD) * years * p.causalShare * p.editionShare * p.independentShare;
  }, 0);
  expect(income).toBeCloseTo(.0006674205041692664, 12);
  expect(10 * c.costUSD / (c.editionQalys + income)).toBeCloseTo(476407240.0903978, 5);
  await page.goto('/california/all');
  const row = page.locator('[data-research-table] tbody tr').filter({hasText:'Youth ALIVE!'});
  await expect(row.locator('td').nth(0)).toContainText('$476.4M');
  await expect(row.locator('td').nth(1)).toContainText('$7.2M');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
