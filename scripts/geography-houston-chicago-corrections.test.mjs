import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=(edition,slug)=>registry.reports.find(r=>r.edition===edition&&r.slug===slug);

test('Houston correction does not treat depression screening as treatment',()=>{
 const r=report('houston','healthcare-for-the-homeless-houston');
 assert.ok(r);
 assert.equal(r.model.inputs.find(i=>i.name==='Dental visits').value,1499);
 assert.equal(r.model.inputs.find(i=>i.name==='Dental patients').value,595);
 assert.ok(!r.model.inputs.some(i=>i.name==='Depression care plans'));
 assert.match(r.sections.monitoring,/659 patients screened for depression/);
 assert.match(r.sections.monitoring,/3,219 dental visits versus 1,499/);
 assert.match(r.sections.funding,/Donor recommendation: HOLD/);
 const weights={harm:.1,null:.2,low:.25,central:.35,favorable:.1};
 let weighted=0;
 for(const scenario of r.model.scenarios){
  const a=JSON.parse(scenario.assumptions);
  const dental=a.dentalVisits/a.visitsPerEpisode*a.symptomCompletion*a.incrementalRelief*a.dentalUtility*a.dentalYears;
  const edition=(dental-a.harmQalys)*a.cashResponse*a.houstonShare;
  assert.ok(Math.abs(edition-scenario.editionQalys)<1e-9,scenario.id);
  weighted+=weights[scenario.id]*edition;
 }
 assert.ok(Math.abs(weighted-2.585799921875)<1e-9);
 assert.ok(Math.abs(10*7844806/r.model.scenarios.find(s=>s.id==='central').editionQalys-55628242.40189474)<1e-5);
});

test('Chicago CRA beta remains whole-recipient, conditional and donor-held',()=>{
 const r=report('chicago','chicago-recovery-alliance');
 assert.ok(r);
 assert.equal(r.stage,'beta');
 assert.equal(r.model.scenarios.length,16);
 assert.match(r.model.costScope,/full-recipient/i);
 assert.match(r.priceScope,/not a donor price/i);
 assert.match(r.sections.funding,/funding|gift|donor/i);
 const central=r.model.scenarios.find(s=>s.id==='central');
 assert.equal(central.costUSD,3908692);
 assert.ok(Math.abs(central.editionQalys-9.579184752173777)<1e-9);
 assert.match(r.summary.reservations.join(' '),/unreconciled|unpriced|unverified/i);
});
