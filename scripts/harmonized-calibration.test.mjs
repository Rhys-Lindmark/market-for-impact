import assert from 'node:assert/strict';
import {calculate,scenarios,survivalQalys,data} from '../lib/harmonized-calibration.mjs';
let checks=0;
function near(a,b) {assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`); checks++;}
function eq(a,b){assert.equal(a,b);checks++;}
function bad(fn){assert.throws(fn);checks++;}
near(survivalQalys(data.defaults.earlySurvival,.03),17.057670941957394);
near(survivalQalys(data.defaults.olderSurvival,.03),10.133078763090055);
near(calculate('amf').netQalys,26.466074111630473);
near(calculate('amf').usdPer10GlobalQalys,3778.422125556399);
near(calculate('ni').netQalys,25.84197900253);
near(calculate('ni').usdPer10GlobalQalys,3869.67267446);
near(calculate('amf',{earlyDeathShare:1}).usdPer10GlobalQalys,3471.6506748921643);
near(calculate('amf',{earlyDeathShare:0}).usdPer10GlobalQalys,5844.055515825912);
near(calculate('ni',{coreShare:1}).usdPer10GlobalQalys,3482.70540701);
for(const id of Object.keys(data.organizations)) {
  const c=calculate(id);
  near(calculate(id,{relativeMortalityYield:.5}).netQalys,c.netQalys/2);
  near(calculate(id,{relativeMortalityYield:.5}).usdPer10GlobalQalys,c.usdPer10GlobalQalys*2);
  near(calculate(id,{survivalPersistenceMultiplier:.8}).netQalys,c.netQalys*.8);
  near(calculate(id,{giftUsd:20000}).netQalys,c.netQalys*2);
  near(calculate(id,{giftUsd:20000}).usdPer10GlobalQalys,c.usdPer10GlobalQalys);
  eq(calculate(id,{relativeMortalityYield:0}).netQalys,0);
  eq(calculate(id,{relativeMortalityYield:0,newSharedHarmPvQalysPerGift:.1}).netQalys,0);
  near(calculate(id,{relativeMortalityYield:0,newIndependentHarmPvQalysPerGift:.1}).netQalys,-.1);
  near(calculate(id,{relativeMortalityYield:.5,newSharedHarmPvQalysPerGift:.1,newIndependentHarmPvQalysPerGift:.1}).netQalys,c.netQalys*.5-.15);
  near(calculate(id,{newSharedHarmPvQalysPerGift:.1}).netQalys,c.netQalys-.1);
  // Independent implementation: explicit midpoint calendar times and two age curves.
  for(const row of scenarios(id)) {
    const p=row.inputs;
    let q=0;
    for(const [share,curve,times] of [[p.earlyDeathShare,p.earlySurvival,p.earlyEventYears],[1-p.earlyDeathShare,p.olderSurvival,p.olderEventYears]])
      for(const t of times) for(let k=0;k<curve.years;k++)
        q+=share/times.length*curve.utility*curve.annualSurvival**(k+.5)/(1+p.discountRate)**(t+k+.5);
    q*=p.giftUsd*p.coreShare/p.nativeUsdPerModeledDeath*p.relativeMortalityYield*p.survivalPersistenceMultiplier;
    q-=p.relativeMortalityYield*p.newSharedHarmPvQalysPerGift+p.newIndependentHarmPvQalysPerGift;
    near(row.netQalys,q);
    if(q>0) near(row.usdPer10GlobalQalys,10*p.giftUsd/q); else eq(row.usdPer10GlobalQalys,null);
    eq(row.directSfQalys,0);eq(row.directBayQalys,0);eq(row.usdPer10DirectSfQalys,null);eq(row.fullResourceUsdPer10Qalys,null);
  }
  for(const o of [{giftUsd:0},{giftUsd:NaN},{nativeUsdPerModeledDeath:0},{coreShare:1.1},{earlyDeathShare:-1},{relativeMortalityYield:-1},{newSharedHarmPvQalysPerGift:-1},{earlyEventYears:[]},{olderEventYears:[-1]},{earlySurvival:{years:2.5}},{olderSurvival:{utility:2}},{directBayHealthShare:.01},{oldFundingHaircut:.3}]) bad(()=>calculate(id,o));
}
bad(()=>calculate('unknown'));
console.log(JSON.stringify({status:'passed',checks,organizations:2,scenariosPerOrganization:data.scenarios.length,central:{amf:calculate('amf').usdPer10GlobalQalys,ni:calculate('ni').usdPer10GlobalQalys}},null,2));
