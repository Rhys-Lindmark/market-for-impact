import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const get=slug=>data.reports.find(r=>r.edition==='usa'&&r.slug===slug);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,`${a} != ${b}`);
const params=s=>s.assumptions.startsWith('{')?JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('}')+1)):Object.fromEntries([...s.assumptions.matchAll(/\b([A-Za-z]+)=(-?\d+(?:\.\d+)?(?:e-?\d+)?)/g)].map(m=>[m[1],+m[2]]));
// ANRF dropped from this loop: recalibrated 2026-10-02, covered by anrf-usa-historical / anrf-usa-calibrated.
for(const slug of ['immunize-org','green-and-healthy-homes-initiative']){
 test(`${slug}: central judgments and alternatives reproduce with partial-health scope`,()=>{
  const r=get(slug);assert.ok(reportPrice(r)>0);assert.ok(r.priceScope);
  assert.match(r.model.scenarios[0].label,/judgment/);
  for(const s of r.model.scenarios.filter(s=>s.editionQalys!==null&&s.id!=='combined-income-unknown')){ // 2026-10-07 prose scenario restating central
   const p=params(s);let q;
   if(slug==='immunize-org'){
    q=s.costUSD/p.C*p.b*p.K*p.V*p.delta*(p.tau*(p.rD*p.e*p.L+p.rH*p.e*p.qH+p.rI*p.e*p.qI)-p.h);
   }else if(slug==='green-and-healthy-homes-initiative'){
    q=s.costUSD*p.b*p.f/p.c*(p.s*p.e*(p.d1+p.d2/1.03)*p.u/365-p.h);
   }else{
    const years=Array.from({length:p.T},(_,i)=>(p.retention*p.cohortSurvival)**i/(1+p.discount)**(i+1)).reduce((a,b)=>a+b,0);
    const rescued=Array.from({length:p.lifeYears},(_,i)=>p.utility*p.rescuedSurvival**(i+1)/(1+p.discount)**(i+1)).reduce((a,b)=>a+b,0);
    const protectedYears=p.N*p.dp*p.a*p.f*p.e*years*p.G/(p.C*p.annualCostMultiplier);
    q=protectedYears*((p.rD*rescued+p.rM*p.qM)*p.excessRisk*p.exposureRemoval*p.transport-p.h);
    close(s.costUSD,p.G+protectedYears*p.extraResourcePerPersonYear);
   }
   close(q,s.allPopulationQalys);close(q*p.g,s.editionQalys);
  }
  assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
  assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 });
}
// RAM beta withdrawn-central test deleted: RAM was recalibrated 2026-10-02; covered by remote-area-medical-usa-historical
// (original diagnostics) and remote-area-medical-usa-calibrated (current model).
test('identical vaccination replacement cancels shared harms',()=>{
 const r=get('immunize-org'),s=r.model.scenarios.find(s=>s.id==='replacement-vaccination');
 assert.equal(s.editionQalys,0);assert.equal(params(s).h,0);assert.equal(params(s).tau,0);
 assert.match(r.model.counterfactual,/Identical timely vaccination/);
});
test('recipient expense means retain original gross costs and separate entities',()=>{
 close(expenseAverage(get('remote-area-medical')),15791828.333333334);
 close(expenseAverage(get('immunize-org')),3463950);
 close(expenseAverage(get('green-and-healthy-homes-initiative')),14228339);
 close(expenseAverage(get('american-nonsmokers-rights-foundation')),3618821.3333333335);
 assert.equal(get('green-and-healthy-homes-initiative').donationUrl,'https://www.greenandhealthyhomes.org/donate/');
 assert.match(get('american-nonsmokers-rights-foundation').model.geographicAttribution,/applies once/);
});
