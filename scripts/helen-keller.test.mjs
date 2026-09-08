import assert from 'node:assert/strict';
import {data,calculate} from '../lib/helen-keller-model.mjs';
export function selfcheck(){let checks=0;const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)));checks++;};
 const rows=data.scenarios.map(s=>({id:s.id,...calculate(s.overrides)}));
 for(const r of rows){const p=r.inputs;let q=0;for(const[w,T,s,u]of[[p.earlyShare,p.earlyYears,p.earlyAnnualSurvival,p.earlyUtility],[1-p.earlyShare,p.olderYears,p.olderAnnualSurvival,p.olderUtility]])for(let k=0;k<T;k++)q+=w*u*s**(k+.5)/(1+p.discountRate)**(p.delayYears+k+.5);
 q*=p.giftUsd*p.coreShare/p.nativeUsdPerDeath*p.relativeYield;q-=p.relativeYield*p.sharedHarmPv+p.independentHarmPv;near(q,r.globalQalys);if(q>0)near(r.usdPer10GlobalQalys,10*p.giftUsd/q);else{assert.equal(r.usdPer10GlobalQalys,null);checks++;}assert.equal(r.sfQalys,0);assert.equal(r.bayQalys,0);checks+=2;}
 near(calculate().usdPer10GlobalQalys,8014.834811786302);near(calculate({relativeYield:.5}).globalQalys,calculate().globalQalys/2);near(calculate({relativeYield:0,independentHarmPv:.1}).globalQalys,-.1);near(calculate({extraGrossResourcesUsd:10000}).grossAssociatedUsdPer10Qalys,calculate().usdPer10GlobalQalys*2);
 for(const o of [{giftUsd:0},{nativeUsdPerDeath:0},{coreShare:2},{earlyYears:1.5},{relativeYield:-1},{oldHaircut:.5}]){assert.throws(()=>calculate(o));checks++;}return{checks,rows};}

console.log(selfcheck().checks+' checks passed');
