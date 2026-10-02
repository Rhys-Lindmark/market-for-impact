import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {expenseAverage,reportPrice} from '../lib/geography-reports.mjs';

const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const progress=JSON.parse(fs.readFileSync(new URL('../docs/geography-progress.json',import.meta.url)));
const report=registry.reports.find(item=>item.edition==='california'&&item.slug==='coalition-for-clean-air');
const historicalModel=JSON.parse(fs.readFileSync(new URL('../data/california/cca-ca-pre-recalibration-model.json',import.meta.url)));

test('Frozen CCA policy illustration independently reconstructs finite durable and acceleration survival',()=>{
 const s=historicalModel.scenarios.find(s=>s.id==='alpha-reference'),x=s.inputs;
 const h1=x.h0*Math.exp(-Math.log(x.HR)/10*x.transport*x.pm),r=Math.log1p(.03),n=40000;
 let durable=0,timing=0;
 for(let i=0;i<n;i++){
  const t=(i+.5)*x.T/n,early=Math.exp(-h1*t),baseline=Math.exp(-x.h0*t);
  const delayed=Math.exp(-x.h0*Math.min(t,x.A)-h1*Math.max(t-x.A,0));
  durable+=(early-baseline)*Math.exp(-r*t)*x.T/n*x.u;
  timing+=(early-delayed)*Math.exp(-r*t)*x.T/n*x.u;
 }
 assert.ok(Math.abs(durable-s.qDurable)<1e-10);
 assert.ok(Math.abs(timing-s.qTiming)<1e-10);
 const q=(x.f*durable+(1-x.f)*timing)/1.03**x.L;
 const giftHealth=s.costUSD/(x.E*x.Y)*x.b*(x.p*x.N*q-x.harm);
 assert.ok(Math.abs(giftHealth-s.editionQalys)<1e-9);
});

test('Coalition for Clean Air historical negative review preserves alpha, null and harm diagnostics',()=>{
 assert.ok(report);
 assert.equal(report.stage,'beta');
 assert.equal(reportPrice({...report,model:historicalModel}),null);
 assert.match(historicalModel.priceScope,/HOLD/);
 assert.match(historicalModel.priceScope,/diagnostic/);
 assert.ok(historicalModel.scenarios.some(item=>item.editionQalys===0));
 assert.ok(historicalModel.scenarios.some(item=>item.editionQalys<0));
 assert.equal(historicalModel.version,'ca-cca-beta-hold-conditional-reference-v3');
 const reference=historicalModel.scenarios.find(s=>s.id==='alpha-reference');
 assert.ok(Math.abs(10*reference.costUSD/reference.editionQalys-3343794.810941493)<1e-6);
});

test('Coalition for Clean Air three-year full-resource costs and edition counts reconcile',()=>{
 assert.deepEqual(report.annualExpenses.map(item=>item.amount),[1472176,2162329,2494912]);
 assert.equal(expenseAverage(report),2043139);
 assert.equal(report.summary.what.length,3);
 assert.equal(report.summary.strengths.length,3);
 assert.equal(report.summary.reservations.length,3);
 const edition=progress.editions.find(item=>item.id==='california');
 assert.equal(edition.alphaPublished,25);
 assert.equal(edition.betaAcceptedPublished,10);
 assert.equal(edition.topPicksPublished,0);
});
