import test from 'node:test';
import assert from 'node:assert/strict';
import reports from '../data/geography-reports.json' with {type:'json'};
import selection from '../data/edition-featured.json' with {type:'json'};
import config from '../data/featured-unit-costs.json' with {type:'json'};
import checks from '../data/featured-unit-cost-checks.json' with {type:'json'};
import {calculateUnitCost,evaluateUnitExpression,formatNativeUnitMoney,nativeUnitForReport,nativeUnitForSF,nativeUnitContext} from '../lib/featured-unit-costs.mjs';
const selected=reports.reports.filter(r=>selection.editions[r.edition]?.slugs.includes(r.slug));
const sf=['recares','self-help-for-the-elderly','hope-pacifica','project-homeless-connect'];
const close=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-12,`${a} != ${b}`);

test('all 32 featured entries are covered; exactly three retain DALY-only by human direction',()=>{
  assert.equal(selected.length,28);
  assert.deepEqual(Object.keys(config.entries).sort(),[...selected.map(r=>r.edition+'/'+r.slug),...sf.map(s=>'san-francisco/'+s)].sort());
  const before=JSON.stringify(reports);
  const results=[...selected.map(nativeUnitForReport),...sf.map(nativeUnitForSF)];
  assert.equal(results.filter(r=>r.priceUSD!==null).length,29);
  assert.deepEqual(results.filter(r=>r.priceUSD===null).map(r=>r.key).sort(),['denver/cultivando','houston/air-alliance-houston','los-angeles/coalition-for-clean-air']);
  for(const row of results){assert.ok(row.scope.length>60);assert.equal(new Set(row.sources.map(s=>s.id)).size,row.sources.length);if(row.priceUSD!==null){assert.ok(row.sources.length||row.kind==='assumed-unit'||row.key==='san-francisco/hope-pacifica');assert.ok(!row.line.includes('DALY'));}}
  assert.equal(JSON.stringify(reports),before);
});
test('independently extracted published numerator and denominator checks reproduce every edition estimate',()=>{
  assert.equal(checks.length,25);
  for(const check of checks){const report=selected.find(r=>r.edition+'/'+r.slug===check.key);const actual=nativeUnitForReport(report);close(actual.costUSD,check.cost);close(actual.units,check.units);close(actual.priceUSD,check.cost/check.units);}
});
test('SF delivery units use current inputs, not historical prices or DALY /10 conversion',()=>{
  close(nativeUnitForSF('recares').priceUSD,72583/45000);
  assert.equal(nativeUnitForSF('self-help-for-the-elderly').priceUSD,600);
  close(nativeUnitForSF('hope-pacifica').priceUSD,40000/1500);
  assert.equal(nativeUnitForSF('project-homeless-connect').priceUSD,150);
  assert.match(nativeUnitForSF('project-homeless-connect').scope,/excludes \$100/);
});
test('native policy counts reproduce existing probability chains, without inventing life expectancy or counting timing-only shifts as prevented cases',()=>{
  const cca=selected.find(r=>r.edition==='california'&&r.slug==='coalition-for-clean-air');
  const c=nativeUnitContext(cca).native.inputs;
  close(nativeUnitForReport(cca).units,(c.gift*c.policyShare/c.annualExpense)*c.funding*c.response*c.realization*c.assignment*(230/12)*5*c.healthCA);
  const cspi=selected.find(r=>r.edition==='usa'&&r.slug==='center-for-science-in-the-public-interest');
  const p=nativeUnitContext(cspi).native.parameters;
  close(nativeUnitForReport(cspi).units,(p.gift/p.annualRecipientCost)*(.255-.25)*.99*100000*(125/265)*.7*.9*.25);
  assert.match(nativeUnitForReport(cspi).scope,/Timing-only acceleration/);
});
test('native prices fail closed on missing, zero, negative or stale data; small costs and compact rounding stay separate from DALY formatting',()=>{
  for(const value of [0,-1,Infinity,NaN,null])assert.throws(()=>evaluateUnitExpression({value},{}));
  assert.throws(()=>evaluateUnitExpression({ref:'missing.value'},{}));
  assert.throws(()=>evaluateUnitExpression({value:4,evidence:{ref:'text',includes:'four'}},{text:'changed'}),/Stale/);
  assert.throws(()=>calculateUnitCost({kind:'observed-average',numerator:{value:10},denominator:{value:0}},{}));
  assert.equal(formatNativeUnitMoney(150), '$150');assert.equal(formatNativeUnitMoney(1479.07),'$1,479');assert.equal(formatNativeUnitMoney(.25),'$0.25');assert.equal(formatNativeUnitMoney(28781.584),'$29K');assert.equal(formatNativeUnitMoney(5206772),'$5.2M');
});
