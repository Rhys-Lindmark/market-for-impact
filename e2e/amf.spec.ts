import {EXPECTED_INTERNATIONAL_COUNT} from './research-contract';
import {test,expect} from '@playwright/test';
test('AMF global report does not alter SF recommendations',async({page})=>{
 await page.goto('/archive/international-research');
 const sf=page.locator('[data-research-slug][data-geography="International"]');await expect(sf).toHaveCount(EXPECTED_INTERNATIONAL_COUNT);
 const amf=page.locator('[data-research-slug="against-malaria-foundation"]');await expect(amf).toContainText('$4K');
 await amf.locator('a').first().click();
 await expect(page.getByRole('heading',{level:1,name:'Against Malaria Foundation',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('$3,778');
 await expect(page.locator('article')).toContainText('0% credited');
 await expect(page.locator('article')).toContainText('not a guaranteed offer');
 await page.getByText('Model inputs and assumptions',{exact:true}).click();
 await expect(page.getByText('Early versus older death share',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const model=await (await page.request.get('/api/amf-model')).json();expect(model.evaluated).toHaveLength(9);expect(model.evaluated[0].globalUsdPer10Qaly).toBeCloseTo(9720.187,2);expect(model.evaluated[0].bayUsdPer10Qaly).toBeNull();
 await page.goto('/');await expect(page.locator('a[href*="against-malaria-foundation"]')).toHaveCount(0);
});
