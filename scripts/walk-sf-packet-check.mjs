import fs from 'node:fs';
import assert from 'node:assert/strict';
const m=JSON.parse(fs.readFileSync('data/san-francisco/walk-sf-cea-v1.json','utf8'));
let checks=0;function eq(a,b,l){checks++;if(a===null||b===null)assert.equal(a,b,l);else assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),l);}
eq(Object.values(m.allocationUsd).reduce((a,b)=>a+b,0),m.giftUsd,'one gift');
eq(m.historicalFinance.programExpenses+m.historicalFinance.managementGeneral+m.historicalFinance.fundraising,m.historicalFinance.expenses,'finance');
for(const s of m.scenarios){
 eq(s.sfResidentShare+s.restBayResidentShare+s.outsideBayShare,1,'geography');
 assert.ok(s.targetRiskShare>=0&&s.targetRiskShare<=1&&s.attributableAccelerationProbability>=0&&s.attributableAccelerationProbability<=1);
 assert.ok(s.delayYears>=1&&s.delayYears<=5&&s.fatalHorizonYears<=40&&s.severeDurationYears<=5);
 let L=0,J=0,W=0;
 for(let i=0;i<s.fatalHorizonYears;i++)L+=s.baselineUtility*Math.exp(-s.competingHazard*(i+.5))*Math.pow(1.03,-i-1);
 for(let i=0;i<s.severeDurationYears;i++)J+=s.severeUtilityLoss*Math.pow(1.03,-i-1);
 for(let i=0;i<s.delayYears;i++)W+=Math.pow(1.03,-s.startYear-i);
 const exposure=s.attributableAccelerationProbability*s.targetRiskShare*W;
 const death=exposure*s.annualFatalities*s.fatalRRR,injury=exposure*s.annualSevereNonfatal*s.severeRRR;
 const all=death*L+injury*J,sf=all*s.sfResidentShare-s.donorHarmSf,rest=all*s.restBayResidentShare-s.donorHarmRestBay,bay=sf+rest;
 const early=Math.pow(1.03,1-s.startYear),late=Math.pow(1.03,1-s.startYear-s.delayYears);
 const timing=m.giftUsd+s.attributableAccelerationProbability*(s.packageCapitalUsd*(early-late)+s.annualMaintenanceUsd*W);
 const gross=m.giftUsd+s.attributableAccelerationProbability*(s.packageCapitalUsd*early+s.annualMaintenanceUsd*W);
 const r=(c,q)=>q>0?c*10/q:null;
 const expected={fatalQalyPerDeath:L,severeQalyPerInjury:J,discountedEarlyExposureYears:W,discountedDeathsAverted:death,discountedSevereInjuriesAverted:injury,allRecipientQaly:all,sfNetQaly:sf,restBayNetQaly:rest,bayIncludingSfNetQaly:bay,outsideBayQaly:all*s.outsideBayShare,donorCostUsd:m.giftUsd,timingResourceUsd:timing,grossForwardResourceStressUsd:gross,sfUsdPer10Qaly:r(m.giftUsd,sf),bayUsdPer10Qaly:r(m.giftUsd,bay),sfTimingUsdPer10Qaly:r(timing,sf),bayTimingUsdPer10Qaly:r(timing,bay),sfGrossStressUsdPer10Qaly:r(gross,sf),bayGrossStressUsdPer10Qaly:r(gross,bay)};
 for(const[k,v]of Object.entries(expected))eq(s.outputs[k],v,s.id+':'+k);
 eq(sf+rest+all*s.outsideBayShare,all-s.donorHarmSf-s.donorHarmRestBay,s.id+' signed partition');
 if(s.attributableAccelerationProbability===0){eq(timing,m.giftUsd,'null resources');eq(gross,m.giftUsd,'null gross');}
 console.log(JSON.stringify({id:s.id,sf,bay,sfRatio:r(m.giftUsd,sf),bayRatio:r(m.giftUsd,bay)}));
}
console.log(`PASS ${checks} assertions across ${m.scenarios.length} scenarios; finite windows, distinct geographies, signed nulls, public-cost timing.`);
