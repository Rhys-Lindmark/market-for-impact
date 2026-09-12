import {test,expect} from '@playwright/test';
test('annual expense column preserves ranking and explains fiscal sponsor missingness',async({page})=>{
 await page.goto('/research');
 await expect(page.getByRole('columnheader',{name:'Avg. annual expenses (3 years)'})).toBeVisible();
 const recares=page.locator('[data-research-slug="recares"] [data-expense-details]');
 await expect(recares).toHaveAttribute('data-average-expenses','88845');
 await recares.locator('summary').click();
 await expect(recares).toContainText('FY2025: $72,583');
 await expect(recares.locator('a')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await recares.locator('summary').click();
 const phc=page.locator('[data-research-slug="project-homeless-connect"] [data-expense-details]');
 await expect(phc.locator('summary')).toHaveText('Not available');
 await phc.locator('summary').click();
 await expect(phc).toContainText('not PHC');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/expenses-'+test.info().project.name+'.png'});
});
