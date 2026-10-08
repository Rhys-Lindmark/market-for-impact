import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';
import {reportPrice} from '../../../lib/geography-reports.mjs';
export const defaults={E:2494912,Y:5,N:500000,Nall:500000,pm:.2,p:.1,b:.5,HR:1.06,transport:.7,h0:.035,u:.75,T:10,L:3,f:.5,A:3,harm:0,gift:10000};
const F=(a,t)=>-Math.expm1(-a*t)/a;
export function calculate(inputs={},ledger=[],induced=[],unknown=false){
 const x={...defaults,...inputs};
 for(const k of ['E','Y','N','Nall','HR','h0','T','gift'])if(!Number.isFinite(x[k])||x[k]<=0)throw Error(k);
 for(const k of ['p','b','transport','u','f'])if(!Number.isFinite(x[k])||x[k]<0||x[k]>1)throw Error(k);
 for(const k of ['L','A','harm'])if(!Number.isFinite(x[k])||x[k]<0)throw Error(k);
 if(!Number.isFinite(x.pm)||x.HR<1||x.N!==x.Nall)throw Error('LA-only model requires Nall=N');
 const effort=x.gift/(x.E*x.Y), causal=effort*x.b*x.p;if(causal>1)throw Error('probability');
 const h1=x.h0*Math.exp(-Math.log(x.HR)/10*x.transport*x.pm),r=Math.log1p(.03),a=Math.min(x.A,x.T);
 const qDurable=x.u*(F(h1+r,x.T)-F(x.h0+r,x.T));
 const qTiming=x.u*(F(h1+r,a)-F(x.h0+r,a)+(1-Math.exp(-(x.h0-h1)*a))*(Math.exp(-(h1+r)*a)-Math.exp(-(h1+r)*x.T))/(h1+r));
 const qConditional=(x.f*qDurable+(1-x.f)*qTiming)/1.03**x.L;
 const health=effort*x.b*(x.p*x.N*qConditional-x.harm);
 const paths=[];
 for(const g of ledger){
  if([g.positiveOverlapShare,g.positiveUSD,g.negativeUSD,g.people,g.baselineUSD].some(v=>!Number.isFinite(v))||g.positiveOverlapShare<0||g.positiveOverlapShare>1||g.positiveUSD<0||g.negativeUSD>0||g.people<=0||g.people>x.N||g.baselineUSD<=0)throw Error('ledger');
  const net=g.positiveUSD*g.positiveOverlapShare+g.negativeUSD;
  for(const [share,years] of [[x.f,x.T],[1-x.f,a]])if(share>0&&years>0&&causal>0)
   paths.push({people:g.people,annualIncomeBeforeUSD:g.baselineUSD,annualIncomeGainUSD:net,years,delayYears:x.L,discountRate:.03,causalShare:causal,editionShare:1,independentShare:share,rationale:g.rationale,counterfactual:g.counterfactual,sourceIds:['cg','ports-current26']});
 }
 for(const g of induced)paths.push({people:g.people,annualIncomeBeforeUSD:g.baselineUSD,annualIncomeGainUSD:g.netUSD,years:1,delayYears:0,discountRate:.03,causalShare:1,editionShare:1,independentShare:1,rationale:'Gift-induced burden remains even if policy fails; unchanged baseline costs excluded.',counterfactual:'No extra donor-induced household engagement without gift.',sourceIds:['cg']});
 const income=unknown?null:paths.reduce((s,p)=>s+incomeHealthyYearEquivalent(p),0);
 const scenario={costUSD:x.gift,editionQalys:health,allPopulationQalys:health,incomePathways:paths,incomeUnknown:unknown,inputs:x,resourceLedger:ledger,inducedLedger:induced,qDurable,qTiming,qConditional,incomeEquivalentYears:income,combinedEquivalentYears:unknown?null:health+income};
 return {...scenario,costPer10Qalys:reportPrice({model:{scenarios:[{...scenario,id:'central'}]}})};
}
export const gainLedger=[{people:1000,baselineUSD:50000,positiveUSD:100,positiveOverlapShare:.5,negativeUSD:-20,rationale:'Conditional baseline-alive households: $100 private care/work resource gain after taxes/benefits/work costs; halve positives for overlapping wellbeing, then deduct full $20 compliance burden jointly before log. Values and distinct household count are judgments; no gross salary or survivor earnings.',counterfactual:'Same households under adopted rules and existing funding; only additional policy-induced change counted.'},{people:1000,baselineUSD:50000,positiveUSD:0,positiveOverlapShare:1,negativeUSD:-10,rationale:'Separate disjoint counterparties lose net $10 annually after resource substitution and displacement. All negatives retained; no public/insurer bill treated as household gain.',counterfactual:'Baseline-alive counterparty households without additional implementation.'}];
export const lossLedger=[{...gainLedger[0],positiveUSD:20,negativeUSD:-200,rationale:'Adverse judgment: baseline-alive households gain $20, discounted to $10 for positive overlap, and bear the full $200 annual net compliance/work burden; joint net loss $190 before log.'},gainLedger[1]];
