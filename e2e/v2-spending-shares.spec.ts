import {test,expect} from '@playwright/test';
test('five V2 spending share supplements remain readable',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 for(const slug of ['spur','housing-action-coalition','north-east-medical-services','pacific-hearing-connection','friends-of-the-urban-forest']){
  const r=await page.goto('/charities/'+slug);expect(r?.ok()).toBe(true);await expect(page.getByText('Shares are calculated as category expense divided by the stated annual denominator. Rounding may make displayed shares differ slightly from 100%.',{exact:true})).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});
