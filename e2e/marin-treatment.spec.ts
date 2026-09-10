import {test, expect} from '@playwright/test';
import {EXPECTED_RESEARCH_COUNT} from './research-contract';

test('Marin report links its conditional Bay estimate to an inspectable model', async ({page}) => {
  await page.goto('/research');
  await expect(page.locator('[data-research-slug]')).toHaveCount(EXPECTED_RESEARCH_COUNT);
  const row=page.locator('[data-research-slug="marin-treatment-center"]');
  await expect(row).toHaveAttribute('data-estimate-geography', 'Bay Area');
  await row.locator('a').first().click();
  await expect(page.getByRole('heading', {level:1, name:'Marin Treatment Center'})).toBeVisible();
  await expect(page.locator('#summary')).toContainText('$7.13M');
  await expect(page.locator('#summary')).toContainText('unknown');
  const response=await page.request.get('/api/marin-treatment-model');
  expect(response.ok()).toBe(true);
  const {evaluated:r}=await response.json();
  expect(r.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeGreaterThan(7e6);
  expect(r.weighted.modeledOrdinaryGiftCostPer10Qaly).toBeLessThan(7.2e6);
  expect(r.weighted.verifiedMarginalGiftCostPer10Qaly).toBeNull();
  expect(r.weighted.sfImpactShare).toBeNull();
  expect(r.scenarios.find((s:{name:string})=>s.name==='null').giftQaly).toBe(0);
  const donationLinks=page.getByRole('link', {name:'Donate', exact:true});
  await expect(donationLinks).toHaveCount(2);
  for (const link of await donationLinks.all()) await expect(link).toHaveAttribute('href', /paypal\.com/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
