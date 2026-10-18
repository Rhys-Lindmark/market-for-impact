import {test,expect} from '@playwright/test';
test('seven active editions and honest stage budgets',async({page})=>{
 await page.goto('/all');
 const directory=page.getByRole('table',{name:'Research by city and region'});
 await expect(directory.getByRole('row')).toHaveCount(9);
 for(const city of ['Seattle','Boston','Atlanta','Detroit'])await expect(directory.getByText(city,{exact:true})).toHaveCount(0);
 for(const city of ['San Francisco','California','USA','New York City','Los Angeles','Chicago','Houston','Denver'])await expect(directory.getByRole('link',{name:city,exact:true})).toBeVisible();
 await page.getByText('Research time and progress',{exact:true}).click();
 await expect(page.getByText(/335 minutes/)).toBeVisible();
 await expect(page.getByText(/15h 30m/)).toBeVisible();
 await expect(page.getByRole('table',{name:'Stage time and progress'}).getByRole('row')).toHaveCount(8);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
