import {test,expect} from '@playwright/test';

test('rounded research effort and concise expandable historical note',async({page})=>{
 await page.goto('/charities/marin-treatment-center');
 const effort=page.locator('.report-research-effort');
 await expect(effort.locator('summary')).toHaveText('Research time: ~37 min on GPT-6 Astra Lite + GPT-5.6 Sol');
 await page.goto('/charities/friends-of-the-urban-forest');
 await expect(page.locator('.report-research-effort summary')).toHaveText(/Research time: ~?\d+ min on GPT-6 Astra Lite \+ GPT-5.6 Sol/);
 await page.goto('/charities/glide');
 const historical=page.locator('.report-research-effort');
 await expect(historical.locator('summary')).toHaveText(/Research time: ~(15|16|17|18|19|20) min on GPT-5.6 Sol Medium/);
 await expect(historical.locator('ul')).not.toBeVisible();
 await historical.locator('summary').click();
 await expect(historical.locator('ul')).toContainText('Historical estimate for research done before time tracking.');
 const label=await historical.locator('summary').textContent();
 await page.reload();
 await expect(page.locator('.report-research-effort summary')).toHaveText(label!);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});
