import {test,expect} from '@playwright/test';
test('hearing report retains finite model and precise recipient warning',async({page})=>{
 await page.goto('/charities/hearing-and-speech-center');
 await expect(page.getByRole('heading',{level:1,name:'Hearing and Speech Center of Northern California',exact:true})).toBeVisible();
 await expect(page.locator('.charity-nutshell')).toContainText('This does not establish clinic closure');
 await expect(page.locator('.charity-report-article')).toContainText('No finite positive price');
 await expect(page.locator('.charity-report-funding-status')).toHaveText('Funding route unverified');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const [response]=await Promise.all([page.waitForResponse(r=>r.url().includes('/api/sf-hearing-model')),page.getByRole('link',{name:'Inspect the model and sources →'}).click()]);
 const j=await response.json();expect(j.evaluated[0].costPerTenQalys).toBe(1250000);
 expect(j.evaluated.at(-1).status).toBe('harm');
});
