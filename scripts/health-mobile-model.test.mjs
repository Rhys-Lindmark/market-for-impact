import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{calculate,scenarios,anchors}from'../lib/health-mobile-model.mjs';
test('exact full saved output parity',()=>assert.deepEqual(calculate(),JSON.parse(fs.readFileSync('data/bay/health-mobile-results.json'))));
test('prior first result preserved',()=>assert.equal(calculate().bayCostPer10,2041965.688426433));
test('whole expense and accounting reconcile',()=>{assert.equal(anchors.expense,363688);assert.equal(-220434+anchors.revenue-anchors.expense+anchors.priorPeriodLiabilityCorrection,anchors.netAssets);assert.equal(anchors.assets-anchors.liabilities,anchors.netAssets)});
test('weights and signed nulls',()=>{const r=calculate();assert.ok(Math.abs(scenarios.reduce((a,s)=>a+s.weight,0)-1)<1e-10);assert.equal(r.rows[0].bayQ,0);assert.equal(r.rows[1].bayQ,0);assert.ok(r.rows[2].bayQ<0)});
test('independent central equation',()=>{const q=10000/363688*600*.3*(.9*.6*.5*.85*.05*.25-.0002)*.7;assert.ok(Math.abs(calculate().rows[4].bayQ-q)<1e-15)});
test('zero gift finite no price',()=>{const r=calculate({gift:0});assert.equal(r.bayQ,0);assert.equal(r.bayCostPer10,null)});
test('half gift proportional',()=>assert.equal(calculate({gift:5000}).bayQ,calculate().bayQ/2));
test('double expense halves benefit',()=>assert.equal(calculate({expense:anchors.expense*2}).bayQ,calculate().bayQ/2));
for(const v of[null,42,'bad',[],true])test('reject options '+JSON.stringify(v),()=>assert.throws(()=>calculate(v)));
test('reject invalid scalar',()=>{for(const v of[NaN,Infinity,-1,'100'])assert.throws(()=>calculate({gift:v}));assert.throws(()=>calculate({gift:10001}));assert.throws(()=>calculate({expense:0}));assert.throws(()=>calculate({expense:Number.MIN_VALUE}))});
test('reject malformed worlds',()=>{for(const w of[null,[],{},[null],[[]],[{}]])assert.throws(()=>calculate({worlds:w}));assert.throws(()=>calculate({worlds:scenarios.map(s=>({...s,id:'same'}))}));assert.throws(()=>calculate({worlds:scenarios.map(s=>({...s,weight:.2}))}))});
test('reject invalid world values',()=>{for(const k of['people','unique','completion','symptomatic','relief','utility','years','funding','bay','harm','weight'])for(const v of[NaN,Infinity,Number.MAX_VALUE,-1,'1'])assert.throws(()=>calculate({worlds:scenarios.map((s,i)=>i?{...s}:{...s,[k]:v})}))});
test('unknown observed volumes and complete resource price remain null',()=>{assert.equal(anchors.observedAnnualPatients,null);assert.equal(calculate().completeResourceCostPer10,null);assert.equal(calculate().verifiedMarginalCostPer10,null)});
test('renderer required arrays and evidence keys',()=>{const r=JSON.parse(fs.readFileSync('data/bay/health-mobile-report.json'));for(const a of[r.summary,r.programSection.steps,r.model.inputs,r.model.sensitivity,r.evidence,r.reservations,r.excludedBenefits,r.sources])assert.ok(Array.isArray(a)&&a.length);for(const e of r.evidence)for(const k of['key','design','population','result','transfer'])assert.equal(typeof e[k],'string');for(const s of r.model.sensitivity)for(const k of['case','headline','detail'])assert.equal(typeof s[k],'string')});
// The 7-case matrix export lived only in /private/tmp (never committed, not regenerable from the repo), so it is skipped
// when absent; the repo-local test after it keeps the part that can be checked.
const sensitivityFixture='/private/tmp/mfi-health-mobile-sensitivity-v1.json';
test('full matrices preserved in sensitivities',{skip:fs.existsSync(sensitivityFixture)?false:'machine-local scratch fixture /private/tmp/mfi-health-mobile-sensitivity-v1.json was never committed and cannot be regenerated'},()=>{const all=JSON.parse(fs.readFileSync(sensitivityFixture));assert.equal(all.length,7);for(const s of all)assert.equal(s.result.rows.length,6)});
test('every gift variant returns the full six-world matrix',()=>{for(const gift of[0,5000,10000])assert.equal(calculate({gift}).rows.length,6)});
