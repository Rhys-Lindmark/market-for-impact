import fs from 'node:fs';import assert from 'node:assert/strict';import {defaults,cases,calculate} from './tennyson-model.mjs';
let checks=0;const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)));checks++;};
const independent=p=>{let D=0;for(let i=0;i<Math.ceil(p.T);i++)D+=Math.min(1,p.T-i)/(1+p.r)**(p.delay+i);const pos=x=>x>0?x*p.overlap:x,hh=p.N*p.unique,changed=hh*p.b*p.eligible*p.completion*p.response*p.success,gain=pos(p.workGain)+pos(p.medicalGain)-p.cost;
const W=(n,B,g,share=p.g)=>.5*n*share/(1+p.r)**p.delay*Math.log((B+g)/B);
let I=W(changed,p.baseline,gain)+W(hh-changed,p.baseline,-p.cost);if(hh&&(p.payerLoss||p.externalCost))I+=W(p.payerPeople,p.payerBaseline,-p.g*(changed*p.payerLoss+hh*p.eligible*p.completion*p.externalCost)/p.payerPeople,1);
const H=p.clinicalUnknown?null:(p.N*p.b*p.eligible*p.completion*p.response*p.q*D-p.N*p.harm/(1+p.r)**p.delay)*p.g,T=H===null||p.incomeUnknown?null:H+I,C=p.costUnknown?null:p.C;
return {costUSD:C,editionQalys:H,incomeEquivalent:I,totalEquivalent:T,price10:C!==null&&T>0?10*C/T:null};};
const report=JSON.parse(fs.readFileSync(new URL('./tennyson-report.json',import.meta.url)));for(const[id,o]of cases){const expected=independent({...defaults,...o}),live=calculate(o),s=report.model.scenarios.find(x=>x.id===id);assert.ok(s,id);for(const[k,v]of Object.entries(expected)){near(live[k],v);near(s[k],v);}}
near(calculate({workGain:-100,overlap:0}).incomeEquivalent,calculate({workGain:-100,overlap:1}).incomeEquivalent);near(calculate({b:0}).incomeEquivalent,.5*defaults.N*defaults.unique*defaults.g*Math.log((defaults.baseline-defaults.cost)/defaults.baseline));near(calculate({N:0,C:0}).totalEquivalent,0);assert.ok(calculate({q:0,harm:0}).incomeEquivalent>0);checks++;near((11829871+13581906+11112242)/3,12174673);
console.log(JSON.stringify({passed:true,independentChecks:checks,scenarios:cases.length}));
