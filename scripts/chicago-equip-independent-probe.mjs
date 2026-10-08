import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const url=process.argv[2]?pathToFileURL(process.argv[2]):new URL('../docs/geography-discovery/chicago-equip-initial-20261005/model.mjs',import.meta.url);
const {calculate,cases,defaults}=await import(url);
let checks=0;
const near=(a,b)=>{checks++;assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);};
// Independent finite clinical sum and household log; no production bridge call.
function reconstruct(o={}){
 const p={...defaults,...o};let years=0;
 for(let y=0;y<p.T;y++)years+=(1+p.discount)**-(p.delay+y);
 const all=p.N*p.a*p.b*p.q*years-p.N*p.b*p.harm/(1+p.discount)**p.delay;
 const exposed=p.N*p.b,changed=exposed*p.financialShare;
 const net=(p.gain>0?p.gain*p.overlap:p.gain)-p.cost;
 let resources=.5*p.g*(changed*Math.log1p(net/p.baseline)+(exposed-changed)*Math.log1p(-p.cost/p.baseline))/(1+p.discount)**p.delay;
 if(p.payerShare&&exposed)resources+=.5*p.g*p.payerPeople*Math.log1p(-changed*p.gain*p.payerShare/p.payerPeople/p.payerBaseline)/(1+p.discount)**p.delay;
 const health=p.clinicalUnknown?null:p.g*all;
 const total=health===null||p.incomeUnknown?null:health+resources;
 return{all:p.clinicalUnknown?null:all,health,resources,total,price:total>0?10*p.C/total:null};
}
for(const[id,o]of cases){
 const got=calculate(o),expected=reconstruct(o);
 assert.equal(got.costUSD,{...defaults,...o}.C);checks++;
 for(const[a,b]of[[got.allPopulationQalys,expected.all],[got.editionQalys,expected.health],[got.incomeEquivalent,expected.resources],[got.totalEquivalent,expected.total],[got.price10,expected.price]]){
  if(b===null){assert.equal(a,null,id);checks++;}else near(a,b);
 }
}
assert.equal(calculate({b:0}).totalEquivalent,0);checks++;
assert.ok(calculate({q:0}).incomeEquivalent>0);checks++;
assert.ok(calculate({gain:-1500}).incomeEquivalent<0);checks++;
near(calculate({gain:-1500,overlap:0}).incomeEquivalent,calculate({gain:-1500,overlap:1}).incomeEquivalent);
assert.ok(calculate({payerShare:1}).incomeEquivalent<calculate().incomeEquivalent);checks++;
assert.ok(calculate({q:0,harm:.1,gain:-1500}).totalEquivalent<0);checks++;
for(const o of[{discount:-.1,b:0},{discount:-1,T:0},{harm:-.1},{a:1.1},{financialShare:-.1},{gain:-defaults.baseline},{baseline:0},{cost:defaults.baseline},{T:6},{C:0}]){assert.throws(()=>calculate(o));checks++;}
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,central:reconstruct()}));
