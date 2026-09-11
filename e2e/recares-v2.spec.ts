import {test,expect} from '@playwright/test';
test('V2 report retains full depth, navigation and central estimate parity',async({page,request})=>{
 // Production HTML has the configured upstream asset origin. Before deployment,
 // serve these exact new-build assets locally rather than stale hosted hashes.
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{
  const url=new URL(route.request().url());
  const response=await request.get(url.pathname+url.search);
  await route.fulfill({response});
 });
 await page.goto('/charities/recares');
 await expect(page.getByRole('heading',{name:'The ReCARES Network',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Spending breakdown',exact:true})).toHaveCount(1);
 expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(9500);
 const links=page.locator('.report-contents a');
 for(let i=0;i<await links.count();i++){
  const href=await links.nth(i).getAttribute('href');expect(href).toBeTruthy();
  await expect(page.locator('[id="'+href!.slice(1)+'"]')).toHaveCount(1);
 }
 await page.getByRole('link',{name:'2. Monitoring and information sharing',exact:true}).click();
 await expect(page).toHaveURL(/#3-what-do-we-know/);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 expect(overflow).toBe(false);
 await expect(page.locator('.report-donate')).toHaveAttribute('href',/^https:/);
 await page.setViewportSize({width:1365,height:900});
 await page.goto('/charities/recares');
 const toc=await page.locator('.report-contents').boundingBox(),article=await page.locator('article').boundingBox();
 expect(toc!.x+toc!.width).toBeLessThan(article!.x);
 await page.screenshot({path:'/private/tmp/recares-v2-desktop.png'});
 const api=await request.get('/api/recares-model');expect(api.ok()).toBeTruthy();
 const data=await api.json();const central=data.evaluated.rows.find((r:{name:string})=>r.name==='central').bayDonorCostPer10Qaly;
 expect(central).toBeCloseTo(74720.3436746678,6);
 await page.goto('/research');
 const row=page.locator('tr').filter({has:page.locator('a[href$="/charities/recares"]')});
 await expect(row).toContainText('$75K');
 await page.goto('/');
 await expect(page.locator('#recares')).toContainText('$74.7K');
 await expect(page.getByText('Ten priorities for giving',{exact:true})).toHaveCount(0);
});
