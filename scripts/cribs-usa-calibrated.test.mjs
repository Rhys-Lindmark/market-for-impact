import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaults,cases,calculate,personYears,survivorsAgeOne} from '../lib/cribs-usa-calibrated-model.mjs';
import {scenarioIncomeEquivalent,reportPrice,researchListPrice,editionResearchEffort} from '../lib/geography-reports.mjs';
import {validateResearchEffort} from '../lib/research-effort.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-12*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Cribs all32 current cases independently reconstruct health and separate household logs',()=>{
 assert.equal(Object.keys(cases).length,32);
 for(const[id,o]of Object.entries(cases)){
  const p={...defaults,...o},r=calculate(o);
  const n=p.gift*p.allocation/p.cashPackage*p.responseProbability*p.conditionalAdditionality;
  let life=p.lifeUtility*(1-p.savedAge)/(1+p.healthDiscount);
  for(let age=1;age<=100;age++)life+=p.lifeUtility*personYears[age]/survivorsAgeOne/(1+p.healthDiscount)**(age+1);
  life*=p.beneficiaryLifeFactor;
  const h=(n*p.saferSleepShare*p.mortalityRisk*p.riskRemoved*life-p.independentHealthHarm*p.gift/10000)*p.geography;
  const log=cash=>.5*Math.log1p(cash/p.incomeBaseline);
  const cash=(n*p.purchaseShare*log(p.purchaseCash-p.burdenCash)+n*(1-p.purchaseShare)*log(-p.burdenCash)+p.gift/10000*log(-p.independentCashHarm))*p.geography/(1+p.incomeDiscount)**p.incomeDelay;
  near(r.lifeQalys,life);
  p.healthKnown&&p.responseKnown?near(r.healthYears,h):assert.equal(r.healthYears,null,id);
  p.incomeKnown&&p.responseKnown?near(r.incomeYears,cash):assert.equal(r.incomeYears,null,id);
  if(p.healthKnown&&p.incomeKnown&&p.responseKnown){near(r.combinedYears,h+cash);if(h+cash>0)near(r.price10,10*p.gift/(h+cash));else assert.equal(r.price10,null);}
  else assert.equal(r.price10,null,id);
 }
 near(calculate().price10,6096539.999634326);near(calculate().institutionalPrice10,6511443.416276107);
});
test('2024 native source vector, age conditioning and saved-date sensitivity are reproducible',()=>{
 const s=JSON.parse(readFileSync(new URL('../docs/geography-discovery/cribs-life2024-2026-10-02.json',import.meta.url)));
 assert.deepEqual(personYears,s.personYears);assert.equal(personYears.length,101);
 near(personYears.reduce((a,b)=>a+b,0)/100000,78.97103157226563);
 near(calculate().lifeQalys,26.497161661028716);
 near(calculate({savedAge:0}).lifeQalys-calculate({savedAge:.5}).lifeQalys,.5*.9/1.03);
 assert.equal(calculate({savedAge:.5}).incomeYears,calculate().incomeYears);
});
test('cash savings apply only to disjoint safe-alternative purchasers, not all crib retail value',()=>{
 const c=calculate(),p=defaults,n=c.additionalPackages;
 near(c.incomeYears,.995*n*.5*(.2*Math.log1p(90/30000)+.8*Math.log1p(-10/30000)));
 assert.notEqual(c.incomeYears,.995*n*.5*Math.log1p(10/30000));
 near(calculate({purchaseShare:0}).healthYears,c.healthYears);
 near(calculate({partnerResource:0}).price10,c.price10);
 near(calculate({partnerResource:0}).institutionalPrice10,c.price10);
 assert.equal(calculate({incomeDelay:1,incomeDiscount:.03}).healthYears,c.healthYears);
 near(calculate({incomeDelay:1,incomeDiscount:.03}).incomeYears,c.incomeYears/1.03);
});
test('null/unknown, negative outcomes and independent harms never become positive clinical prices',()=>{
 assert.equal(calculate({responseProbability:0}).combinedYears,0);
 assert.equal(calculate({responseProbability:0}).price10,null);
 assert.equal(calculate({incomeKnown:false}).combinedYears,null);
 assert.equal(calculate({responseKnown:false}).healthYears,null);
 assert.ok(calculate(cases.downside).combinedYears<0);
 assert.ok(calculate(cases.adverseSubstitution).healthYears<0);
 const h=calculate(cases.independentHarmsAtZero);
 assert.ok(h.healthYears<0&&h.incomeYears<0);near(h.householdCashBurden,9.95);near(h.householdNetCash,-9.95);
 assert.ok(calculate({lifeUtility:0}).incomeYears>0);assert.equal(calculate({lifeUtility:0}).healthYears,0);
});
test('bounded thought experiment rejects nonfinite, extrapolated or incompatible inputs',()=>{
 for(const o of [null,[],Object.create(null),{gift:0},{gift:10001},{responseProbability:1.01},{cashPackage:0},{burdenCash:30000},{saferSleepShare:.9,purchaseShare:.2},{savedAge:2},{healthKnown:1},{riskRemoved:Infinity},{constructor:1},{toString:1}])assert.throws(()=>calculate(o));
});
test('closed author intervals sum284 seconds with no drafting, test or wait padding',()=>{
 const d=JSON.parse(readFileSync(new URL('../docs/geography-discovery/cribs-usa-recalibration-2026-10-02.closed.json',import.meta.url)));
 near(d.intervals.filter(s=>s.counted).reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0),284);
 assert.equal(d.model.rawRuntimeModel,null);assert.equal(d.model.name,'GPT-6.1 Sol');
 assert.equal(d.waitTimeCreditedSeconds,0);assert.equal(d.draftTestTimeCreditedSeconds,0);
});
test('all32 report cases serialize exact clinical, cash, unknown and historical boundaries',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=d.reports.find(r=>r.edition==='usa'&&r.slug==='cribs-for-kids');
 for(const[id,o]of Object.entries(cases)){
  const c=calculate(o),s=r.model.scenarios.find(s=>s.id===id);assert.ok(s,id);
  c.healthYears===null?assert.equal(s.editionQalys,null):near(s.editionQalys,c.healthYears);
  c.incomeYears===null?assert.equal(scenarioIncomeEquivalent(s),null):near(scenarioIncomeEquivalent(s),c.incomeYears);
  c.price10===null?assert.equal(s.costPer10Qalys,null):near(s.costPer10Qalys,c.price10);
 }
 near(reportPrice(r),6096539.999634326);near(researchListPrice(r),6096539.999634326);
 assert.equal(r.model.scenarios.length,34);assert.equal(r.historicalModel.scenarios.length,7);
 assert.equal(r.historicalModel.scenarios.find(s=>s.id==='central').editionQalys,null);
 const h=r.model.scenarios.find(s=>s.id==='historical-alpha-central');near(10*h.costUSD/h.editionQalys,3741114.8522259634);
});
test('three closed Cribs intervals occur once in both registries with per-model minutes',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const e=JSON.parse(readFileSync(new URL('../data/research-effort.json',import.meta.url)));validateResearchEffort(e);
 const r=d.reports.find(r=>r.edition==='usa'&&r.slug==='cribs-for-kids');
 const c=JSON.parse(readFileSync(new URL('../docs/geography-discovery/cribs-usa-recalibration-2026-10-02.closed.json',import.meta.url))).intervals.filter(s=>s.counted);
 for(const[suffix,i]of [['health',0],['resources',1],['arithmetic',2]]){
  const id='usa-cribs-recalibration-'+suffix+'-20261002';assert.equal(r.sessionIds.filter(x=>x===id).length,1);
  for(const list of [d.sessions,e.organizations[r.organization].sessions]){
   const found=list.filter(s=>s.id===id);assert.equal(found.length,1);const s=found[0];
   assert.equal(s.startedAt,c[i].startedAt);assert.equal(s.endedAt,c[i].endedAt);
   assert.equal(s.rawRuntimeModel,null);assert.match(s.model.evidence,/User-confirmed model assignment/);
  }
 }
 assert.equal(editionResearchEffort(d,r).label,'Research time: ~10 min on GPT-6 Astra Light + ~33 min on GPT-6.1 Sol');
});
