import assert from 'node:assert/strict';
import fs from 'node:fs';
import model from '../data/san-francisco/phc-portfolio-model-v1.json' with {type:'json'};
import registry from '../data/research-effort.json' with {type:'json'};
import {calculate,diagnostics,incomeJudgments,inputsFor} from '../lib/phc-first-health-income-model.mjs';
import {calculate as prior} from '../lib/phc-portfolio-model.mjs';
import {validateResearchEffort} from '../lib/research-effort.mjs';
let n=0;const check=f=>{f();n++;};const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
const p=model.central_inputs,c=calculate(p),d=diagnostics(),old=prior(p);
check(()=>assert.deepEqual(c.historicalHealthOnly,old));
check(()=>close(c.donor_bay_per_10q,774408.3401731638));
check(()=>assert.equal(c.incomeBay,0));
const rate=Math.log1p(.03)+.02,distinct=100000*.2/150*.5,receipt=Math.exp(-rate*.1);
const integrated=.75*receipt*(-Math.expm1(-rate))/rate;
check(()=>close(integrated,c.components[0].years));
const earnings=.5*distinct*.7*.1*integrated*Math.log1p(.05)*.98;
const purchase=.5*distinct*.05*receipt*Math.log1p(50/50000)*.98;
const burden=.5*(distinct*receipt+(100000*.1/1500*.5*.8+100000*.15/1500*.5*.8)*Math.exp(-rate*.25))*Math.log1p(-6/50000)*.98;
check(()=>close(d.incomeCases.earnings.incomeBay,earnings));
check(()=>close(d.incomeCases.purchase.incomeBay,purchase));
check(()=>close(d.incomeCases.adverse.incomeBay,burden));
for(const r of Object.values(d.incomeCases))check(()=>close(r.healthBay,c.healthBay));
check(()=>close(d.incomeCases.earnings.donor_bay_per_10q,1000000/(c.healthBay+earnings)));
check(()=>assert.equal(d.healthCases.nullHealthPositiveCash.healthBay,0));
check(()=>assert.ok(d.healthCases.nullHealthPositiveCash.incomeBay>0));
check(()=>assert.ok(d.healthCases.nullHealthPositiveEarnings.incomeBay>0));
check(()=>assert.ok(d.healthCases.jointAdverse.incomeBay<0));
check(()=>assert.ok(d.healthCases.jointAdverse.healthBay<0));
check(()=>assert.equal(d.healthCases.jointAdverse.donor_bay_per_10q,null));
for(const key of ['noCapacity','noFunding','completeNull']){check(()=>assert.equal(d.healthCases[key].bay_q,0));check(()=>assert.equal(d.healthCases[key].donor_bay_per_10q,null));check(()=>assert.equal(d.healthCases[key].gift_usd,100000));}
for(const s of model.scenarios)for(const j of [incomeJudgments,d.incomeCases.purchase.incomeInputs,d.incomeCases.earnings.incomeInputs,d.incomeCases.adverse.incomeInputs]){
 const x=inputsFor(model,s);
 // Purchase group must remain inside each scenario's equivalent-alternative group.
 const capped=structuredClone(j);for(const path of x.pathways)capped[path.id].purchaseShare=Math.min(capped[path.id].purchaseShare,1-path.alternative_free_share);
 const out=calculate(x,capped);
 for(const geo of ['US','Bay','SF'])check(()=>close(out['health'+geo]+out['income'+geo],out[geo==='US'?'us_q':geo==='Bay'?'bay_q':'sf_q']));
 check(()=>close(out.us_q,out.components.reduce((sum,row)=>sum+row.totalUS,0)-x.independent_harm_us_q));
 if(out.bay_q>0)check(()=>close(out.donor_bay_per_10q*out.bay_q,10*x.gift_usd));else check(()=>assert.equal(out.donor_bay_per_10q,null));
}
const zero=calculate({...p,sf_share:0,bay_share:0},d.incomeCases.purchase.incomeInputs);
check(()=>assert.equal(zero.bay_q,0));check(()=>assert.equal(zero.donor_bay_per_10q,null));
const overlap=structuredClone(incomeJudgments);overlap.glasses.purchaseShare=.31;
check(()=>assert.throws(()=>calculate(p,overlap)));
for(const [key,value]of [['baselineIncomeUSD',0],['acquisitionCostUSD',50000],['netEarningsGainFraction',-1],['earningsShare',2],['purchaseSavingUSD',Infinity]]){
 const bad=structuredClone(incomeJudgments);bad.glasses[key]=value;check(()=>assert.throws(()=>calculate(p,bad)));
}
check(()=>assert.equal(d.annual.available,false));
check(()=>validateResearchEffort(registry));
const report=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/phc-v2-report.json',import.meta.url)));
// Current report no longer uses this preserved first calibration.
check(()=>assert.equal(report.fullMarkdown,fs.readFileSync(new URL('../docs/reports/phc-v2.md',import.meta.url),'utf8')));
check(()=>assert.ok(report.fullMarkdown.includes('THRIVE')));
check(()=>assert.ok(fs.readFileSync(new URL('../lib/research-cost-ranking.mjs',import.meta.url),'utf8').includes('phc-calibrated-model.mjs')));
check(()=>assert.ok(fs.readFileSync(new URL('../app/charities/project-homeless-connect/page.tsx',import.meta.url),'utf8').includes('calibrationDate="2026-10-01"')));
check(()=>assert.ok(fs.readFileSync(new URL('../components/LongFormResearchReport.tsx',import.meta.url),'utf8').includes('earlierEffort.estimated&&earlierEffort.minutes!==null')));
console.log(n+'/'+n+' PHC health/income, signed, timing, scope, provenance and report-wiring checks passed.');
