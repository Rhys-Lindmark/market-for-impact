// Integration destination: lib/changent-legacy-recalibration.mjs. Static sibling imports.
import {inputs as historicalInputs, scenarios as historicalScenarios, calculate as historicalFollowup, calculatePublishedLifetimeBestGuess as historicalLifetime} from './nfp-portfolio-model.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const version='changent-legacy-health-net-resources-20261004';
// Old property names are historical calculator schema, NOT fiscal-year assertions.
export const inputs={...historicalInputs,fy2024Expense:31183784,fy2024Revenue:28694523,fy2024NetAssets:110471423,fy2024Surplus:-2489261,nfpDirectProgramExpense:17009763,childFirstDirectProgramExpense:4920100,totalProgramServiceExpense:21929863,nfpFamiliesServed2024:57087,childFirstFamiliesServed2024:2738};
// Annual NET dollars per household/course: each positive row already net of mechanism
// costs (e.g. taxes/benefit clawback); independent family participation costs separate.
// No government medical savings, child lifetime wages, survivor wages, or GDP.
export const moneyPriors={
 harm:{nfp:{earnings:-100,transfers:-100,medical:0,participation:-100},childFirst:{earnings:-200,transfers:-100,medical:0,participation:-120},positiveIndependentShare:.25},
 null:{nfp:{earnings:0,transfers:0,medical:0,participation:-30},childFirst:{earnings:0,transfers:0,medical:0,participation:-30},positiveIndependentShare:.25},
 cautiousPositive:{nfp:{earnings:0,transfers:45,medical:0,participation:-30},childFirst:{earnings:100,transfers:0,medical:0,participation:-30},positiveIndependentShare:.50},
 central:{nfp:{earnings:0,transfers:90,medical:0,participation:-30},childFirst:{earnings:300,transfers:0,medical:0,participation:-60},positiveIndependentShare:.50},
 favorableStress:{nfp:{earnings:300,transfers:180,medical:30,participation:-30},childFirst:{earnings:900,transfers:100,medical:30,participation:-60},positiveIndependentShare:.75},
};
export function positiveOnlyNet(rows,share){
 if(!Number.isFinite(share)||share<0||share>1||!rows||Object.values(rows).some(x=>!Number.isFinite(x)))throw Error('Invalid signed rows');
 return Object.values(rows).reduce((s,x)=>s+(x>0?x*share:x),0);
}
export function resourceEquivalent(people,rows,share,years,delayYears,baseline=20000){
 const net=positiveOnlyNet(rows,share);
 if(people===0)return {netAnnualUSD:net,equivalent:0};
 return {netAnnualUSD:net,equivalent:incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD:baseline,annualIncomeGainUSD:net,years,delayYears,discountRate:.03,causalShare:1,editionShare:1,independentShare:1})};
}
export function calculate(modelInputs=inputs,scenarioInputs=historicalScenarios,resourcePriors=moneyPriors){
 if(typeof modelInputs?.fy2024Surplus!=='number'||!Number.isFinite(modelInputs.fy2024Surplus))throw new TypeError('Accounting surplus must be a finite signed number');
 // Legacy validation wrongly forbids an accounting deficit in an unused
 // diagnostic field. Use old validated diagnostic only inside helper; restore
 // actual signed FY2025 field in every returned input, never change formulas.
 const compatibilityInputs={...modelInputs,fy2024Surplus:historicalInputs.fy2024Surplus};
 const clinical=historicalFollowup(compatibilityInputs,structuredClone(scenarioInputs));
 clinical.inputs=structuredClone(modelInputs);
 const worlds=clinical.scenarios.map(s=>{
  const p=resourcePriors[s.name];if(!p)throw Error('Missing resource prior '+s.name);
  // Clinical/service realization applied once. Financial effect is per OFFERED
  // family with transferable trial ITT gains: conservative realized denominators.
  const nfp=resourceEquivalent(s.nfpRealizedFullCourseEquivalents,p.nfp,p.positiveIndependentShare,2,.5);
  const cf=resourceEquivalent(s.childFirstUniqueRealizedFamilyEquivalents,p.childFirst,p.positiveIndependentShare,1,0);
  const incomeEquivalent=nfp.equivalent+cf.equivalent,totalEquivalent=s.giftQaly+incomeEquivalent;
  return {...s,clinicalQaly:s.giftQaly,nfpResources:nfp,childFirstResources:cf,incomeEquivalent,totalEquivalent,conditionalDonorCostPer10Equivalent:totalEquivalent>0?modelInputs.gift*10/totalEquivalent:null,conditionalGrossCostPer10Equivalent:totalEquivalent>0?s.grossResources*10/totalEquivalent:null,bayEquivalent:null,sfEquivalent:null};
 });
 const weighted=worlds.reduce((a,s)=>{for(const k of ['clinicalQaly','incomeEquivalent','totalEquivalent','grossResources'])a[k]+=s.weight*s[k];return a;},{clinicalQaly:0,incomeEquivalent:0,totalEquivalent:0,grossResources:0});
 weighted.conditionalDonorCostPer10Equivalent=weighted.totalEquivalent>0?modelInputs.gift*10/weighted.totalEquivalent:null;
 weighted.conditionalGrossCostPer10Equivalent=weighted.totalEquivalent>0?weighted.grossResources*10/weighted.totalEquivalent:null;
 const central=worlds.find(x=>x.name==='central');
 const lifetime=historicalLifetime(compatibilityInputs,structuredClone(scenarioInputs));lifetime.inputs=structuredClone(modelInputs);
 return {version,status:'HOLD',ordinaryWholeGiftExpectedValue:null,unknownChannels:['current marginal support-to-affiliate expansion','NFP maternal take-home earnings','household out-of-pocket medical savings','net benefit displacement and donor opportunity cost','current NFP family-years/course completion','Child First Bay/SF allocation'],clinicalHorizon:'finite follow-up-bound; lifetime-prior outputs diagnostics only',financialYear:2025,serviceCountYear:2025,costVintage:'historical affiliate delivery sensitivities; not current marginal quotes',inputs:structuredClone(modelInputs),moneyPriors:structuredClone(resourcePriors),central,worlds,weighted,historicalDiagnostics:{followup:historicalFollowup(),publishedLifetimePrior:historicalLifetime()},currentLifetimePriorDiagnostic:lifetime,geography:{nfpClinicalPriorOnlyBay:clinical.weighted.bayQaly,nfpClinicalPriorOnlySf:clinical.weighted.sfQaly,totalBay:null,totalSf:null}};
}
export function selfTest(){
 let n=0;const check=(b,m)=>{n++;if(!b)throw Error(m);};
 check(positiveOnlyNet({earnings:100,fees:-40,travel:-20},0)===-60,'overlap zero preserves all harm');
 check(positiveOnlyNet({earnings:100,fees:-40},.5)===10,'mixed positive net');
 check(positiveOnlyNet({fees:-40},.25)===-40,'negative not attenuated');
 const before=JSON.stringify({inputs, historicalInputs,historicalScenarios,moneyPriors});const a=calculate();check(before===JSON.stringify({inputs,historicalInputs,historicalScenarios,moneyPriors}),'pure');
 check(a.worlds.length===5,'world count');check(a.worlds[0].clinicalQaly<0&&a.worlds[0].incomeEquivalent<0,'clinical and financial harms');
 check(a.ordinaryWholeGiftExpectedValue===null&&a.geography.totalBay===null,'unknown not zero');
 for(const s of a.worlds){check(Math.abs(s.reconstructedInternalExpense-s.additionalSupportCash)<1e-7,'allocated cost conservation');check(s.grossResources>=inputs.gift,'gift counted once');check(Math.abs(s.totalEquivalent-s.clinicalQaly-s.incomeEquivalent)<1e-12,'signed channel sum');}
 const b=calculate({...inputs,gift:inputs.gift*2});check(Math.abs(b.weighted.totalEquivalent-2*a.weighted.totalEquivalent)<1e-12,'gift scaling');
 check(resourceEquivalent(1,{fees:-40},0,1,0).equivalent<0,'zero independence downside');
 check(resourceEquivalent(1,{g:100},1,1,2).equivalent<resourceEquivalent(1,{g:100},1,1,0).equivalent,'delay');
 check(a.historicalDiagnostics.followup.weighted.giftQaly!==a.historicalDiagnostics.publishedLifetimePrior.weighted.giftQaly,'historical horizons distinct');
 return {passed:n};
}
