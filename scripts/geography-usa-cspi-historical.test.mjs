import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const freeze=JSON.parse(readFileSync(new URL('../data/usa/cspi-usa-pre-recalibration-model.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)));
test('all eleven CSPI historical policy and signed-health scenarios reproduce',()=>{
 assert.equal(freeze.model.scenarios.length,11);
 for(const s of freeze.model.scenarios){
  const p=JSON.parse(s.assumptions.match(/Inputs (\{.*?\}); H=/)[1]);
  const H=(2100000-700000)*(p.dm/565)*p.e*p.t/(1.03**p.L);
  const timing=p.f+(1-p.f)*(1-1.03**(-p.accel));
  const q=s.costUSD/(p.C*5)*p.b*(p.p*p.a*H*timing-p.h);
  near(s.allPopulationQalys,q);near(s.editionQalys,q*p.g);
 }
 near(10*freeze.model.scenarios[0].costUSD/freeze.model.scenarios[0].editionQalys,freeze.initialPricePerBetterLife);
});
test('five full recipient years, finite clinical scale and timing contrast remain separate',()=>{
 near(17926322*5,89631610);
 const c=freeze.model.scenarios.find(s=>s.id==='central'),timing=freeze.model.scenarios.find(s=>s.id==='timing-only');
 near(timing.editionQalys/c.editionQalys,1-1.03**(-3));
 assert.ok(freeze.model.scenarios.find(s=>s.id==='downside').editionQalys<0);
});
