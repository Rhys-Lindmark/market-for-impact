import {test,expect} from '@playwright/test';

test('bottom SF price cells are compact while retaining signed and conditional scope',async({page,request})=>{
  await page.goto('/san-francisco/all');
  const newDoor=page.locator('[data-research-slug="new-door-ventures"]');
  const nems=page.locator('[data-research-slug="north-east-medical-services"]');
  await expect(newDoor.locator('td').first()).toHaveText('-$1.5MModeled harm');
  await expect(nems.locator('td').first()).toHaveText('$120K');
  await expect(newDoor.locator('td a').first()).toHaveAttribute('aria-label',/per DALY.*negative value means modeled harm/);
  await expect(nems.locator('td a').first()).toHaveAttribute('title',/ordinary-donation total remain unknown/);
  for(const row of [newDoor,nems])expect(await row.getAttribute('data-cost-per-ten-qalys')).toBeNull();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const api=await request.get('/api/newdoor-portfolio-model');
  expect(api.ok()).toBe(true);
  const model=await api.json();
  expect(model.reference.result.bayIncludingSfCombinedHealthyYearEquivalent).toBeCloseTo(-.06496831924402403,12);
  expect(model.reference.result.bayUsdPer10ConditionalCombinedHealthyYearEquivalent).toBeNull();
  expect(model.ordinaryDonation.result.ordinaryDonationExpectedValue).toBeNull();
});
