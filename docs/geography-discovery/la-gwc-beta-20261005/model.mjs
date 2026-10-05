import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';
import {reportPrice} from '../../../lib/geography-reports.mjs';
export const defaults={C:2974158,R:878000,people:100,claimantUnits:194,baseline:30000,retention:.75,workerCost:300,a:.5,b:.5,g:.95,positiveShare:1,payerPeople:50,payerBaseline:100000,payerLocalShare:.5,delay:1,years:1,gift:10000,clinicalPerPerson:0,clinicalAttribution:.5,clinicalHarm:0,inducedPeople:0,inducedCost:0};
export function calculate(input={},unknown=false){
 const x={...defaults,...input};for(const k of Object.keys(x))if(!Number.isFinite(x[k]))throw Error(k);
 for(const k of ['C','people','baseline','payerPeople','payerBaseline','years','gift'])if(x[k]<=0)throw Error(k);
 for(const k of ['retention','a','b','g','positiveShare','payerLocalShare','clinicalAttribution'])if(x[k]<0||x[k]>1)throw Error(k);
 for(const k of ['R','workerCost','delay','clinicalPerPerson','clinicalHarm','inducedPeople','inducedCost'])if(x[k]<0)throw Error(k);
 if(x.people>x.claimantUnits||x.claimantUnits>194||x.claimantUnits<=0)throw Error('paid proxy must not exceed finite claimant proxy194');
 const effort=x.gift/x.C*x.b;if(effort>1)throw Error('outside small-gift domain');
 // One-time collected wages are distributed over specified consumption years;
 // never repeat the full award each year.
 const receipt=x.R/x.people*x.retention*x.positiveShare;
 const paidNet=(receipt-x.workerCost)/x.years,failedNet=-x.workerCost/x.years;
 const paths=[];const path=(people,before,net,causal,local,rationale)=>{if(causal>0&&local>0)paths.push({people,annualIncomeBeforeUSD:before,annualIncomeGainUSD:net,years:x.years,delayYears:x.delay,discountRate:.03,causalShare:causal,editionShare:local,independentShare:1,rationale,counterfactual:'Current SB62,DIR enforcement,other advocates and employer payments continue without added gift.',sourceIds:['o24','law','cg']});};
 path(x.people,x.baseline,paidNet,effort*x.a,x.g,'Paid outcome: same-household retained wage/penalty receipt after tax/benefit offsets and positive overlap, minus full claimant time/travel/retaliation costs jointly before log. Recipient count,baseline and incidence are judgments.');
 path(x.people,x.baseline,failedNet,effort*(1-x.a),x.g,'Alternative-enforcement/replacement outcome: no additional wage receipt but all additional claimant costs remain. Mutually exclusive branch for same households; no duplicate people.');
 if(x.claimantUnits>x.people)path(x.claimantUnits-x.people,x.baseline,failedNet,effort,x.g,'Other assisted claimant units have no credited incremental wage receipt but retain full additional time/travel/foregone earnings burden independent of wage recovery probability. Claimant194 is judged household-equivalent incidence, not confirmed distinct households; disjoint from paid-proxy units.');
 path(x.payerPeople,x.payerBaseline,-x.R/x.payerPeople/x.years,effort*x.a,x.payerLocalShare,'Full payer/counterparty loss for incremental transfer, without positive overlap haircut. Disjoint owner/counterparty households and baseline/local incidence are judgments. Public tax receipts and insurance offsets remain unpriced.');
 if(x.inducedPeople>0&&x.inducedCost>0)paths.push({people:x.inducedPeople,annualIncomeBeforeUSD:x.baseline,annualIncomeGainUSD:-x.inducedCost,years:1,delayYears:0,discountRate:.03,causalShare:1,editionShare:x.g,independentShare:1,rationale:'Independent donor-induced worker engagement burden survives funding/policy failure.',counterfactual:'No additional engagement without gift.',sourceIds:['cg','clinic']});
 const income=unknown?null:paths.reduce((s,p)=>s+incomeHealthyYearEquivalent(p),0);
 const health=effort*x.g*(x.people*x.clinicalPerPerson*x.clinicalAttribution-x.clinicalHarm)/1.03**x.delay;
 const s={costUSD:x.gift,editionQalys:health,allPopulationQalys:health,incomePathways:paths,incomeUnknown:unknown,incomeEquivalentYears:income,combinedEquivalentYears:unknown?null:health+income,inputs:x};
 return {...s,costPer10Qalys:reportPrice({model:{scenarios:[{...s,id:'central'}]}})};
}
export const caseInputs=[['central',{}],['financial-only',{}],['clinical-null',{}],['lower-attribution',{a:.1}],['funding-replacement',{b:.1}],['complete-replacement',{b:0}],['true-zero',{b:0}],['no-additional-wages',{a:0}],['lower-baseline',{baseline:15000}],['higher-baseline',{baseline:50000}],['fewer-paid-households',{people:50}],['all-assisted-paid',{people:194}],['concentrated-awards',{people:10}],['claimant-household-overlap',{claimantUnits:100}],['two-year-spread',{years:2}],['five-year-delay',{delay:5}],['lower-net-retention',{retention:.4}],['full-local-payer-loss',{payerLocalShare:1}],['poorer-counterparties',{payerBaseline:30000,payerLocalShare:1}],['positive-overlap-half',{positiveShare:.5}],['retaliation-and-displacement',{workerCost:10000}],['failed-access-harm',{b:0,inducedPeople:1,inducedCost:100}],['independent-clinical-prior',{clinicalPerPerson:.01}],['clinical-harm',{clinicalHarm:1}],['unknown-net-incidence',{},true],['capital-cost-double',{C:5948316}],['three-year-cost-mean',{C:2162239.3333333335}]];
