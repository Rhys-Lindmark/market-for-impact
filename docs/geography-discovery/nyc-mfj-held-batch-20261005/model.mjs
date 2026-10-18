export const defaults={C:25609806,N:2500,z:.8,l:1,e:.15,r:.5,a:.75,b:.5,g:.98,u:.06,T:2,m:.02,d:.03,h:0,delay:0};
export function health(overrides={}){
 const p={...defaults,...overrides};
 if(Object.values(p).some(v=>!Number.isFinite(v))||p.C<0||p.N<0||p.T<=0||p.h<0||p.delay<0||p.m<0||p.d<0||['z','l','e','r','a','b','g','u'].some(k=>p[k]<0||p[k]>1))throw Error('Invalid health parameters');
 let A=0;for(let t=1;t<=Math.ceil(p.T);t++)A+=Math.min(1,p.T-t+1)*Math.exp(-p.m*t)/(1+p.d)**(t+p.delay);
 const exposure=p.N*p.z*p.l*p.b,success=exposure*p.e*p.r*p.a;
 const all=success*p.u*A-p.h;
 return {costUSD:p.C,allPopulationQalys:all,editionQalys:p.g*all,additionalServiceExposures:exposure,additionalStabilityOutcomes:success*p.g};
}
// Exact shared calculator convention; the selftest compares against repository implementation.
export function income(p){
 const {people,annualIncomeBeforeUSD:B,annualIncomeGainUSD:G,years,causalShare=1,editionShare=1,independentShare=1,delayYears=0,discountRate=0}=p;
 if([people,B,G,years,causalShare,editionShare,independentShare,delayYears,discountRate].some(v=>!Number.isFinite(v))||people<=0||B<=0||B+G<=0||years<=0||delayYears<0||discountRate<0||[causalShare,editionShare,independentShare].some(v=>v<0||v>1))throw Error('Invalid income parameters');
 if(G<0&&(causalShare!==1||independentShare!==1))throw Error('Do not haircut negative household burdens');
 let Y=0;for(let i=0;i<Math.ceil(years);i++)Y+=Math.min(1,years-i)/(1+discountRate)**(delayYears+i);
 return .5*people*Y*Math.log1p(G/B)*causalShare*editionShare*independentShare;
}
export function pathways(p={},q={}){
 const v={...defaults,...p},f={baseline:12000,netGain:1200,burden:25,resourceShare:.5,overlap:.5,years:1,delay:0,...q};
 if(!Number.isFinite(f.resourceShare)||f.resourceShare<0||f.resourceShare>1||!Number.isFinite(f.burden)||f.burden<0)throw Error('Invalid household ledger');
 const E=v.N*v.z*v.l*v.b,won=E*v.e*v.r*v.a*f.resourceShare,other=E-won;
 const base={annualIncomeBeforeUSD:f.baseline,years:f.years,causalShare:1,editionShare:v.g,delayYears:f.delay,discountRate:v.d,counterfactual:'Public counsel, other legal aid, hospital social workers, ordinary benefits administration and collection limits persist. Household gains are actual collectible resources after taxes, withdrawn benefits, paid rent, fees, travel, documentation and earnings costs; no face-value debt or gross entitlement is credited.',sourceIds:['mental','benefits','consumer','workplace','cg']};
 return [...(won>0?[{...base,people:won,annualIncomeGainUSD:f.netGain,independentShare:f.overlap,rationale:'Judgment: half the additional legal-stability successes produce net household resources. One joint ledger per household, not stacked housing/SSI/debt/wage awards. Positive overlap share discounts economic welfare already represented in psychiatric stability; it is not a success coefficient.'}]:[]),...(other>0?[{...base,people:other,annualIncomeGainUSD:-f.burden,independentShare:1,delayYears:0,rationale:'Disjoint remaining service-exposed households incur net paperwork/travel/lost-time costs without a collectible gain. Full causal weight; costs persist when clinical effects are null. Winner net gain already includes winner costs.'}]:[])];
}
export function evaluate(id,label,p={},q={},unknown=false){
 const h=health(p),ps=unknown?[]:pathways(p,q),I=unknown?null:ps.reduce((sum,x)=>sum+income(x),0),W=I===null?null:h.editionQalys+I;
 return {id,label,...h,parameterOverrides:p,incomeParameters:q,incomeUnknown:unknown,incomePathways:ps,incomeEquivalentHealthyYears:I,totalWelfareEquivalentHealthyYears:W,pricePer10HealthQalys:h.editionQalys>0?10*h.costUSD/h.editionQalys:null,pricePer10Qalys:W>0?10*h.costUSD/W:null,pricePer10WelfareEquivalent:W>0?10*h.costUSD/W:null,assumptions:JSON.stringify({health:{...defaults,...p},income:{baseline:12000,netGain:1200,burden:25,resourceShare:.5,overlap:.5,years:1,delay:0,...q},unknown})};
}
export function scenarios(){return [
 evaluate('central','Conditional stability and signed net household resources'),
 evaluate('clinical-null','No clinical utility gain; financial ledger persists',{u:0}),
 evaluate('financial-only','No clinical gain; all distinct financial welfare retained',{u:0},{overlap:1}),
 evaluate('zero','No additional capacity or induced household exposure',{b:0}),
 evaluate('adverse','Clinical harm and no collectible gains',{u:0,h:1},{resourceShare:0,burden:100}),
 evaluate('unknown','Unresolved household resource effects',{}, {},true),
 evaluate('financial-loss','No collectible gains; ordinary burdens remain',{}, {resourceShare:0}),
 evaluate('funding-low','10% donor capacity response',{b:.1}),
 evaluate('funding-high','75% donor capacity response',{b:.75}),
 evaluate('overlap','Complete overlap removes positive income credit',{}, {overlap:0}),
 evaluate('no-overlap','No overlap in independently measured welfare',{}, {overlap:1}),
 evaluate('duration','Six-month resource effect and one-year health benefit',{T:1},{years:.5}),
 evaluate('delay','Two-year implementation and collection delay',{delay:2},{delay:2}),
 evaluate('geography','80% MSA residence allocation',{g:.8}),
 evaluate('resource','10% additional partner-resource cost',{C:defaults.C*1.1}),
 evaluate('fiscal','Illustrative donor plus incremental fiscal-resource denominator',{C:defaults.C+33750}),
 evaluate('counterparty','Counterparty welfare offsets all gross positive financial credit',{}, {netGain:0}),
 evaluate('upside','Uncalibrated larger net household resources',{}, {netGain:4800,resourceShare:1,years:2}),
 evaluate('downside','Heavy household burden erases health reference',{}, {resourceShare:0,burden:250})
 ];}
