import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frozen=JSON.parse(readFileSync(new URL('../data/usa/surgery-on-sunday-usa-pre-recalibration-model.json',import.meta.url))).model;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('Surgery on Sunday frozen USA model independently reproduces every historical clinical case',()=>{
 for(const s of frozen.scenarios.filter(s=>s.assumptions.startsWith('G='))){
  const p=Object.fromEntries(s.assumptions.split('. Gross QALY')[0].split(', ').map(pair=>{const [key,value]=pair.split('=');return [key,Number(value.replace(/\.$/,''))];}));
  let gross=0;for(let t=1;t<=p.T;t++)gross+=p['Δu']*((1-p.m)/1.03)**t;
  const benefit=p.G/p.c*p.b*(p.s*gross-p.h);
  near(s.allPopulationQalys,benefit);near(s.editionQalys,benefit*p.g);
 }
 const central=frozen.scenarios.find(s=>s.id==='central');
 near(10*central.costUSD/central.editionQalys,405175.8308002147);
 const added=frozen.scenarios.find(s=>s.id==='resource-cost-added'),nominal=frozen.scenarios.find(s=>s.id==='resource-cost');
 near(added.editionQalys,central.editionQalys);near(nominal.editionQalys,central.editionQalys);
 near(added.costUSD,10000+5000*2);near(nominal.costUSD,10000+5000*(10000/3000));
 assert.equal(frozen.scenarios.find(s=>s.id==='zero-additionality').editionQalys,0);
 assert.ok(frozen.scenarios.find(s=>s.id==='equivalent-care-harm').editionQalys<0);
});
