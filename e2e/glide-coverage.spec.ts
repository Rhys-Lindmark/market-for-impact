import {test,expect} from '@playwright/test';
test('GLIDE partial whole-gift report matches Bay comparison and retains history',async({page})=>{
 await page.goto('/charities/glide');
 await expect(page.locator('main')).toContainText('$4,890,657');
 await expect(page.locator('main')).toContainText('not a complete expected return');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const r=await page.request.get('/api/glide-coverage-model');expect(r.ok()).toBe(true);
 const m=await r.json();expect(m.evaluated).toHaveLength(20);
 const c=m.evaluated.find((s:{id:string})=>s.id==='central').outputs;
 expect(c.bay.donor_per_10q).toBeCloseTo(4890656.595775775,6);
 expect(m.verifiedMarginalFundingOffer).toBeNull();
 await page.getByRole('link',{name:'Historical rental-assistance-only research'}).click();
 await expect(page.locator('main')).toContainText('39 households');
 await page.goto('/research');
 await expect(page.locator('[data-research-slug="glide"]')).toHaveAttribute('data-cost-per-ten-qalys',String(c.bay.donor_per_10q));
});
