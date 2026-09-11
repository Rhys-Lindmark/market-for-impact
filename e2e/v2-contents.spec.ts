import {test,expect} from '@playwright/test';
import mappings from '../data/report-contents-map.json' with {type:'json'};
const reports=[['recares','The ReCARES Network'],['breathe-california','Breathe California'],['spur','SPUR'],['glide','GLIDE Foundation'],['hope-pacifica','HOPE Pacifica'],['housing-action-coalition','Housing Action Coalition'],['project-homeless-connect','Project Homeless Connect'],['pacific-hearing-connection','Pacific Hearing Connection'],['north-east-medical-services','North East Medical Services'],['friends-of-the-urban-forest','Friends of the Urban Forest']];
test('V2 contents share seven primary links and retain original anchors',async({page,request})=>{
 await page.route('https://market-for-impact.rhyslindmark.chatgpt.site/_next/**',async route=>{const u=new URL(route.request().url());await route.fulfill({response:await request.get(u.pathname+u.search)});});
 for(const [slug,name]of reports){
  const response=await page.goto('/charities/'+slug);expect(response?.ok(),slug).toBe(true);
  const overview=page.locator('#research-summary');
  await expect(overview.locator('p').first()).toContainText('What do they do?');
  if(await overview.locator('[data-top-ten-summary]').count())await expect(overview.locator('[data-summary-reasons] > li')).toHaveCount(3);
  else await expect(overview).toContainText('Why this approach interests us');
  await expect(overview).toContainText('Our main reservations');
  await expect(overview).not.toContainText(/whole-gift|whole-organization|HOLD giving/);
  const effort=page.locator('.report-research-effort');
  await expect(effort.locator('summary')).not.toContainText(/v2|beta/i);
  await expect(page.locator('.report-heading .report-date').first()).toHaveText('Updated: 11 September 2026');
  await expect(effort.locator('ul')).not.toBeVisible();
  await effort.locator('summary').click();
  await expect(effort.locator('li')).toHaveCount(2);
  await expect(effort.locator('li').first()).toContainText('v1:');
  await expect(effort.locator('li').last()).toContainText('v2:');
  await effort.locator('summary').click();
  await expect(page.locator('[data-toc-primary]')).toHaveText(['Summary','1. What do they do?','2. Monitoring and information sharing','3. Qualitative assessment','4. What do you get for your dollar?','5. Funding and previous grants','6. Sources']);
  for(const id of Object.keys((mappings as Record<string,Record<string,string>>)[name]))await expect(page.locator('[id="'+id+'"]')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const disclosure=page.locator('.report-contents-group').first();await disclosure.locator('summary').click({position:{x:3,y:8}});await expect(disclosure).toHaveAttribute('open','');
 }
 await page.setViewportSize({width:1365,height:900});const toc=await page.locator('.report-contents').boundingBox(),article=await page.locator('article').boundingBox();expect(toc!.x+toc!.width).toBeLessThan(article!.x);
});
