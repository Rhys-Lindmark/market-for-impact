import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=path.resolve(process.argv[2]??'docs/geography-discovery/la-public-law-center-beta-20261005');
const {defaults,cases,calculate}=await import(pathToFileURL(path.join(dir,'model.mjs')));
let checks=0;
const near=(a,b)=>{checks++;if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);};
const signed=(x,k)=>x>0?x*k:x;
function reconstruct(p){
 const exposure=p.K*p.uniqueHouseholdShare*p.b,paid=exposure*p.financialShare*p.financialAdditionality;
 let raw=0;for(let y=0;y<p.T;y++)raw+=p.K*p.e*p.a*p.b*p.q*Math.pow(1+p.discount,-p.healthDelay-y);
 const health=(signed(raw,p.z)-exposure*p.clinicalHarmPerHousehold*Math.pow(1+p.discount,-p.healthDelay))*p.g;
 const paths=[{people:paid,base:p.baseline,net:signed(p.resourceGain,p.positiveOverlap)-p.processCost},{people:exposure-paid,base:p.baseline,net:-p.processCost}].filter(x=>x.people>0);
 if(exposure>0&&(p.payerTransferShare!==0||p.partnerCostPerHousehold!==0))paths.push({people:p.payerPeople,base:p.payerBaseline,net:-(paid*p.resourceGain*p.payerTransferShare+exposure*p.partnerCostPerHousehold)/p.payerPeople});
 let resources=0;for(const r of paths){let years=0;for(let y=0;y<p.resourceYears;y++)years+=Math.pow(1+p.discount,-p.resourceDelay-y);resources+=.5*r.people*Math.log((r.base+r.net)/r.base)*p.g*years;}
 const h=p.clinicalUnknown?null:health,combined=h===null||p.incomeUnknown?null:h+resources;
 return {exposure,paid,health:h,resources,combined,price:combined>0?10*p.C/combined:null,paths};
}
const report=JSON.parse(fs.readFileSync(path.join(dir,'report.json'),'utf8'));
for(const[id,overrides]of cases){const p={...defaults,...overrides},expected=reconstruct(p),got=calculate(overrides);near(got.exposure,expected.exposure);near(got.paid,expected.paid);near(got.editionQalys,expected.health);near(got.incomeEquivalent,expected.resources);near(got.totalEquivalent,expected.combined);near(got.price10,expected.price);assert.equal(got.incomePathways.length,expected.paths.length);checks++;
 for(let i=0;i<expected.paths.length;i++){const a=got.incomePathways[i],b=expected.paths[i];near(a.people,b.people);near(a.annualIncomeBeforeUSD,b.base);near(a.annualIncomeGainUSD,b.net);}
 const s=report.model.scenarios.find(x=>x.id===id);assert.ok(s,id);checks++;near(s.costUSD,p.C);near(s.editionQalys,expected.health);near(s.incomeEquivalent,expected.resources);near(s.totalEquivalent,expected.combined);near(s.price10,expected.price);
}
assert.equal(calculate({q:0}).editionQalys,0);assert.ok(calculate({q:0}).incomeEquivalent<0);checks+=2;
assert.equal(calculate({b:0}).totalEquivalent,0);assert.equal(calculate({b:0}).price10,null);checks+=2;
near(calculate({resourceGain:-1500,positiveOverlap:0}).incomeEquivalent,calculate({resourceGain:-1500,positiveOverlap:1}).incomeEquivalent);
near(calculate({q:-.03,z:0}).editionQalys,calculate({q:-.03,z:1}).editionQalys);
assert.ok(calculate({payerTransferShare:1}).incomeEquivalent<calculate().incomeEquivalent);checks++;
for(const bad of [{baseline:0},{b:-1},{g:2},{C:0},{processCost:-1},{resourceYears:0},{K:10001}]){assert.throws(()=>calculate(bad));checks++;}
console.log(JSON.stringify({independentChecks:checks,cases:cases.length,central:calculate(),status:'PASS'}));
