import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEditionReports,reportPrice,reportsForEdition} from '../lib/geography-reports.mjs';
import {evaluateClinicalPolicy,evaluateEnergyPolicy} from '../lib/usa-policy-calibration.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const data=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
validateEditionReports(data,progress);
const usa=progress.editions.find(e=>e.id==='usa');
assert.equal(usa.selectedAlphaIds.length,25);
assert.equal(usa.supplementalAlphaIds.length,3);
assert.equal(usa.alphaPublished,28);
const expected=[
 ['institute-for-progress',3597698,100000*.1*.25*.25*.079*.5*.1*.25*.9/1.03**10.5,3079238,8.4375],
 ['1day-sooner',2424138,100000*.1*.25*.25*.079*.5*.15*.35*.4/1.03**10.5,2424138,7.5],
 ['foundation-for-american-innovation',3719664,7.884*.5*.25*.7*15*.5*.25*.1*.2/1.03**10,3719664,.75]
];
for(const [slug,cost,q,oldCost,oldQ] of expected){
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug===slug);
 assert.ok(r);
 assert.equal(r.stage,'beta');
 assert.ok(usa.betaIds.includes(r.organizationId));
 assert.ok(usa.supplementalBetaIds.includes(r.organizationId));
 assert.ok(Math.abs(r.model.scenarios.find(s=>s.id==='central').editionQalys-q)<1e-10);
 const old=r.model.scenarios.find(s=>s.id==='historical-alpha-central');
 assert.equal(old.costUSD,oldCost);assert.equal(old.editionQalys,oldQ);
 assert.ok(Math.abs(reportPrice(r)-cost*10/q)<1e-6);
 assert.notEqual(reportPrice(r),oldCost*10/oldQ,'Deep review must expose its accepted revised estimate');
 const evaluate=r.model.calibration.kind==='energy'?evaluateEnergyPolicy:evaluateClinicalPolicy;
 for(const [id,inputs] of Object.entries(r.model.calibration.scenarioInputs)){
  const s=r.model.scenarios.find(s=>s.id===id),calculated=evaluate(inputs);
  assert.equal(s.costUSD,calculated.costUSD);
  assert.equal(s.editionQalys,calculated.editionQalys);
  assert.equal(s.allPopulationQalys,calculated.allPopulationQalys);
 }
 assert.equal(r.model.scenarios.find(s=>s.id==='three-year-funded-cycle').costUSD,cost*3);
 assert.match(r.sections.cost,/revised estimate|deeper review/i);
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 assert.equal(r.annualExpenses.length,3);
 for(const id of r.sessionIds){
  const s=data.sessions.find(s=>s.id===id);
  assert.ok(s.model===null||s.model.id==='gpt-6.1-sol');
  assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));
 }
}
assert.equal(usa.betaAcceptedPublished,13);
assert.equal(usa.supplementalBetaIds.length,3);
for(const slug of expected.map(([slug])=>slug)){
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug===slug);
 assert.ok(r.sources.filter(s=>/990/.test(s.title)).length>=3,'Three original annual returns cited');
 assert.match(r.sections.funding,/program|management|fundraising/i);
 assert.ok(Object.values(r.sections).join(' ').split(/\s+/).length>=1500,'Substantive deeper review, not stage-only relabel');
 assert.ok(r.sessionIds.some(id=>data.sessions.some(s=>s.id===id&&s.stage==='beta'&&s.phase==='research')));
 assert.match(r.model.uncertainty,/judgment|illustrative|scenario|hypothes/i);
}
assert.ok(reportsForEdition(data,'usa').slice(0,4).every(r=>!expected.some(([slug])=>slug===r.slug)));
console.log('USA abundance supplement, estimates, timing and unchanged top four passed.');
