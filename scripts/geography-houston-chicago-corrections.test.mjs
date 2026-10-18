import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=(edition,slug)=>registry.reports.find(r=>r.edition===edition&&r.slug===slug);

test('Houston correction does not treat depression screening as treatment',()=>{
 const r=report('houston','healthcare-for-the-homeless-houston');
 assert.ok(r);
 assert.ok(!r.model.inputs.some(i=>i.name==='Depression care plans'));
 assert.match(r.sections.monitoring,/659 patients screened for depression/);
 assert.match(r.sections.monitoring,/3,219 dental visits versus 1,499/);
 assert.match(r.sections.funding,/Donor recommendation: HOLD/);
 // HCHH was rebuilt on 2026-10-07 (815b129) with a new input set and scenario list; the original alpha
 // arithmetic (dental visits 1,499, not depression care) survives as historical-alpha-central.
 const h=r.model.scenarios.find(s=>s.id==='historical-alpha-central');
 const a=JSON.parse(h.assumptions);
 const dental=a.dentalVisits/a.visitsPerEpisode*a.symptomCompletion*a.incrementalRelief*a.dentalUtility*a.dentalYears;
 const edition=(dental-a.harmQalys)*a.cashResponse*a.houstonShare;
 assert.equal(a.dentalVisits,1499);
 assert.ok(Math.abs(edition-h.editionQalys)<1e-9);
 assert.ok(Math.abs(10*7844806/edition-55628242.40189474)<1e-5);
});

test('Chicago CRA beta remains whole-recipient, conditional and donor-held',()=>{
 const r=report('chicago','chicago-recovery-alliance');
 assert.ok(r);
 assert.equal(r.stage,'beta');
 // Recalibrated 2026-10-02 (d05c40f; numbers covered by cra-chicago-calibrated.test.mjs): the gift-based central
 // replaced the 16 audited-accrual scenarios, so only the scope and donor-hold safeguards are pinned here.
 assert.ok(r.model.scenarios.length>=16);
 assert.match(r.model.costScope,/full[- ]recipient/i);
 assert.match(r.priceScope,/conditional/i);
 assert.match(r.priceScope,/not verified marginal capacity|not a donor price/i);
 assert.match(r.sections.funding,/funding|gift|donor/i);
 assert.match(r.summary.reservations.join(' '),/unreconciled|unpriced|unverified|disagree/i);
});
