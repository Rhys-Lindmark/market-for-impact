import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {displayImpactPrice,formatImpactPrice,impactText,impactTextEdits,impactDisplayMetadata,impactEquation,withImpactDisplay} from '../lib/impact-metric.mjs';
import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('all canonical geography comparisons scale exactly once and reverse without changing model data',()=>{
 const before=JSON.stringify(registry);
 for(const r of registry.reports){for(const p of [reportPrice(r),researchListPrice(r)]){assert.equal(displayImpactPrice(p),p===null?null:p/10);assert.equal(displayImpactPrice(p,'better-life'),p);assert.equal(impactDisplayMetadata(p).canonicalPriceUSDPerTenEquivalentYears,p);}}
 assert.equal(JSON.stringify(registry),before);
});
test('range, transition, region and equation labels; budgets/gifts/native costs untouched',()=>{
 assert.equal(impactText('Initial $3M → current $4M per better life; a $100,000 gift buys $600 courses.'),'Initial $300K → current $400K per DALY-equivalent; a $100,000 gift buys $600 courses.');
 assert.equal(impactText('$5M–$7M per ten combined Bay equivalent years.'),'$500K–$700K per DALY-equivalent.');
 assert.equal(impactText('Donor costs per 10 QALYs are $758,920 US, $774,408 Bay, and $798,863 SF.'),'Donor costs per DALY-equivalent are $75.89K US, $77.44K Bay, and $79.89K SF.');
 assert.equal(impactText('$3M per 10 Bay Area QALYs (10 QALYs).'),'$300K per DALY-equivalent (one modeled equivalent year).');
 assert.equal(impactText('$9.57m per ten California QALYs'),'$957K per DALY-equivalent');
 assert.equal(impactText('$9.1bn per 10 local QALYs'),'$910M per DALY-equivalent');
 assert.equal(impactText('$3M, $4M and $5M per better life'),'$300K, $400K and $500K per DALY-equivalent');
});
test('offset-specific overrides and bound recognition cannot divide twice',()=>{
 const source='$100,000 gift; $100,000 per better life.';
 assert.equal(impactText(source,{overrides:[{source:'$100,000',offset:15,canonicalPriceUSD:100000}]}),'$100,000 gift; $10K per DALY-equivalent.');
 assert.equal(impactText(source,{id:'better-life'}),source);
 assert.throws(()=>impactText(source,{overrides:[{source:'$100,000',offset:1}]}));
});
test('finite/unknown/nonpositive and exact display metadata',()=>{
 assert.equal(displayImpactPrice(null),null);assert.equal(displayImpactPrice(0),0);assert.equal(displayImpactPrice(-100),-10);
 assert.throws(()=>displayImpactPrice(Infinity));assert.throws(()=>displayImpactPrice(10,'invalid'));
 assert.equal(formatImpactPrice(175983633.8618442),'$17.6M');
 assert.equal(impactTextEdits('Annual costs $100,000. Household wages $25,000.').length,0);
});
test('comparison equation converts only price, retaining gift and clinical totals',()=>{
 const e=impactEquation({label:'Gift-time incremental health',expression:'Gift × yield × net QALYs',result:'$10,000 produces 26.466 net QALYs; full gift ÷ QALYs × 10 = $3,778'});
 assert.equal(e.result,'$10,000 produces 26.466 net QALYs; full gift ÷ QALYs = $377.8');
 assert.equal(e.expression,'Gift × yield × net QALYs');
});
test('model API display is labelled and leaves canonical prices, gifts and quantities intact',()=>{
 const original={giftUSD:100000,central:{costPerTenQalys:200000,netQalys:5},cases:[{price10:10000}]};
 const view=withImpactDisplay(original);
 assert.equal(view.central.costPerTenQalys,200000);assert.equal(view.giftUSD,100000);assert.equal(view.central.netQalys,5);
 assert.equal(view.comparisonDisplay.priceUSDByCanonicalField['central.costPerTenQalys'],20000);
 assert.equal(view.comparisonDisplay.priceUSDByCanonicalField['cases.0.price10'],1000);
 assert.equal(original.comparisonDisplay,undefined);
});
