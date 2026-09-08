import {test,expect} from '@playwright/test';
test('calibrated headlines match versioned global models and retain historical APIs',async({page})=>{
 for(const [slug,id,value] of [['against-malaria-foundation','amf',3778.4221255564],['new-incentives','ni',3869.6726744576786]] as const){
 await page.goto('/charities/'+slug);
 await expect(page.locator('article')).toContainText(id==='amf'?'$3,778':'$3,870');
 const d=await(await page.request.get('/api/harmonized-calibration?org='+id)).json();
 expect(d.evaluated[id].central.usdPer10GlobalQalys).toBeCloseTo(value,6);
 expect(d.evaluated[id].scenarios).toHaveLength(12);
 expect(d.evaluated[id].central.usdPer10DirectSfQalys).toBeNull();
 expect(d.evaluated[id].scenarios.find((s:{scenarioId:string})=>s.scenarioId==='zero-yield-independent-harm').netQalys).toBeLessThan(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 expect((await page.request.get('/api/harmonized-calibration?org=unknown')).status()).toBe(400);
});
