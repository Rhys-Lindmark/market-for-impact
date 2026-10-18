export const defaults={F:49631474,E:2377336,I:10034,L:121838,f:1.1,V:2333500,M:3689816,D:520,N:15115,r:.8,c:.7,a:.5,u:.01,b:.5,g:.975,t:1,delay:0,d:.03,h:0,X:0};
export const resourceDefaults={baseline:18000,householdShare:.8,foodValue:500,substitutedFood:250,otherConsumption:50,benefitsTaxes:0,burden:25,distinctShare:.5,years:1,displacementShare:0,displacementLoss:0};
export function income(p){
 const {people,annualIncomeBeforeUSD:B,annualIncomeGainUSD:G,years,causalShare=1,editionShare=1,independentShare=1,delayYears=0,discountRate=0}=p;
 if([people,B,G,years,causalShare,editionShare,independentShare,delayYears,discountRate].some(v=>!Number.isFinite(v))||people<=0||B<=0||B+G<=0||years<=0||delayYears<0||discountRate<0||[causalShare,editionShare,independentShare].some(v=>v<0||v>1))throw Error('Invalid income inputs');
 let Y=0;for(let k=0;k<Math.ceil(years);k++)Y+=Math.min(1,years-k)/(1+discountRate)**(delayYears+k);
 return .5*people*Y*Math.log1p(G/B)*causalShare*editionShare*independentShare;
}
export function health(overrides={}){
 const p={...defaults,...overrides};
 if(Object.values(p).some(v=>!Number.isFinite(v))||['F','E','I','L','V','M','N','delay','d','h','X'].some(k=>p[k]<0)||p.D<=0||p.f<=0||['r','c','a','u','b','g','t'].some(k=>p[k]<0||p[k]>1))throw Error('Invalid parameters');
 const C=(p.F+p.E+p.I+p.L+p.V)*p.f+p.X;
 const deliveredDoseYears=Math.min(p.M/p.D,p.N)*p.r*p.t;
 const additionalConsumedDoseYears=deliveredDoseYears*p.c*p.b;
 const all=additionalConsumedDoseYears*p.a*p.u/(1+p.d)**p.delay-p.h;
 return {costUSD:C,allPopulationQalys:all,editionQalys:all*p.g,deliveredDoseYears,additionalConsumedDoseYears};
}
export function pathways(overrides={},resources={}){
 const p={...defaults,...overrides},q={...resourceDefaults,...resources},H=health(p).additionalConsumedDoseYears*q.householdShare;
 if(Object.values(q).some(v=>!Number.isFinite(v))||q.baseline<=0||q.years<=0||q.years>1||['householdShare','distinctShare','displacementShare'].some(k=>q[k]<0||q[k]>1)||['foodValue','substitutedFood','otherConsumption','benefitsTaxes','burden','displacementLoss'].some(k=>q[k]<0))throw Error('Invalid resource ledger');
 // Net food + consumption jointly within the same household before log. Overlap
 // reduces only the positive resource subtotal; all taxes, benefit loss and
 // burdens survive clinical-null and complete-overlap cases at full weight.
 const positive=Math.max(0,q.foodValue-q.substitutedFood+q.otherConsumption);
 const loss=Math.max(0,q.substitutedFood-q.foodValue-q.otherConsumption)+q.benefitsTaxes+q.burden;
 const G=positive*q.distinctShare-loss;
 const nonconsumers=health(p).deliveredDoseYears*p.b*(1-p.c)*q.householdShare;
 const joint={people:H,annualIncomeBeforeUSD:q.baseline,annualIncomeGainUSD:G,years:q.years,causalShare:1,editionShare:p.g,independentShare:1,delayYears:p.delay,discountRate:p.d,rationale:'Conditional household-year equivalents, not unique observed households. One adult-equivalent welfare unit per modeled household, no extra household-size multiplier. Joint annual ledger: independently valued positive net food/other consumption after substitution, minus all benefits/taxes/caregiver/admin/travel burdens. Clinical overlap removes only positive credit. Baseline includes existing cash and in-kind food. No retail meal price or healthcare-payer saving is household income.',counterfactual:'SNAP and ordinary benefits, other food providers, insurer-funded meals, purchased groceries and family care remain available. Freed food spending is valued only if retained as other consumption, and never counted again as cash savings. No gross wages, benefits entitlement or fiscal savings are credited.',sourceIds:['faq','cross','trial','cg'],ledger:{...q,positiveSubtotalUSD:positive,negativeSubtotalUSD:loss,netIndependentResourceUSD:G}};
 const displaced=q.displacementShare>0?[{people:H*q.displacementShare,annualIncomeBeforeUSD:q.baseline,annualIncomeGainUSD:-q.displacementLoss,years:q.years,causalShare:1,editionShare:p.g,independentShare:1,delayYears:p.delay,discountRate:p.d,rationale:'Disjoint other households lose food/support when constrained providers or public budgets reallocate resources; full signed loss, never overlap-discounted. Illustrative unmeasured downside, not GLWD observation.',counterfactual:'Other households would retain the displaced support absent additional GLWD activity. Recipient reimbursements are already in full resource cost; this is a separate welfare incidence sensitivity, not a duplicated payer expense.',sourceIds:['partners','cg']}]:[];
 const burdenOnly=nonconsumers>0?[{people:nonconsumers,annualIncomeBeforeUSD:q.baseline,annualIncomeGainUSD:-q.burden,years:q.years,causalShare:1,editionShare:p.g,independentShare:1,delayYears:p.delay,discountRate:p.d,rationale:'Disjoint nonconsuming delivered-dose household-equivalent cohort: full receipt, storage, scheduling, caregiver/admin/time burden remains without positive consumed-food resources. Meal consumption zero does not erase delivery burdens.',counterfactual:'Absent additional delivered meal exposure these households do not incur the modeled delivery burden; no clinical overlap discount or positive benefit assigned.',sourceIds:['faq','trial','cg']}]:[];
 return [...(H>0?[joint]:[]),...burdenOnly,...displaced];
}
export function evaluate(id,label,p={},q={},unknown=false){
 const h=health(p),ps=unknown?[]:pathways(p,q),I=unknown?null:ps.reduce((s,x)=>s+income(x),0),W=I===null?null:h.editionQalys+I;
 return {id,label,...h,parameterOverrides:p,incomeParameters:q,incomeUnknown:unknown,incomePathways:ps,incomeEquivalentHealthyYears:I,totalWelfareEquivalentHealthyYears:W,pricePer10HealthQalys:h.editionQalys>0?10*h.costUSD/h.editionQalys:null,pricePer10Qalys:W>0?10*h.costUSD/W:null,pricePer10WelfareEquivalent:W>0?10*h.costUSD/W:null,assumptions:JSON.stringify({health:{...defaults,...p},resources:{...resourceDefaults,...q},unknown})};
}
export function scenarios(){return [
 evaluate('central','Conditional health and net household consumption'),
 evaluate('clinical-null','Clinical null; independent consumption and full burdens persist',{u:0}),
 evaluate('financial-only','Clinical null; all distinct net consumption counted',{u:0},{distinctShare:1}),
 evaluate('zero','No additional capacity or induced household exposure',{b:0}),
 evaluate('negative','No clinical benefit and net household loss',{u:0},{foodValue:0,otherConsumption:0}),
 evaluate('adverse','Clinical harm plus household loss',{u:0,h:2},{foodValue:0,otherConsumption:0,burden:100}),
 evaluate('unknown','Unresolved household effects',{}, {},true),
 evaluate('complete-overlap','All positive food welfare overlaps clinical outcome',{}, {distinctShare:0}),
 evaluate('no-overlap','No shared clinical and consumption welfare',{}, {distinctShare:1}),
 evaluate('funding-low','10% additional capacity response',{b:.1}),
 evaluate('funding-high','80% additional capacity response',{b:.8}),
 evaluate('consumption-low','40% meal utilization',{c:.4}),
 evaluate('consumption-high','All delivered meal dose consumed',{c:1}),
 evaluate('consumption-zero','No food consumed; delivery burdens remain',{c:0}),
 evaluate('duration','Half as much service exposure',{t:.5}),
 evaluate('delay','Two-year delay for a new service-onset cohort',{delay:2}),
 evaluate('dose-624','Legacy 12-meal reference intensity',{D:624}),
 evaluate('dose-1040','20-meal reference intensity',{D:1040}),
 evaluate('geography-low','Only known borough share attributed',{g:.95}),
 evaluate('geography-high','All pooled counties attributed',{g:1}),
 evaluate('volunteer-low','Lower volunteer opportunity-resource estimate',{V:1000000}),
 evaluate('volunteer-high','147000 hours valued at 35 USD',{V:5145000}),
 evaluate('extra-resources','Unpriced clinical/admin resources 10% recipient cost',{X:5722072.84}),
 evaluate('fiscal','Illustrative extra counterparty administrative resources',{X:1000000}),
 evaluate('displacement','Benefits loss or displaced other household resources',{}, {benefitsTaxes:300}),
 evaluate('other-households','Disjoint other households lose 300 USD support',{}, {displacementShare:.1,displacementLoss:300}),
 evaluate('baseline-high','Higher existing household resources',{}, {baseline:36000}),
 evaluate('current-summary-proxy','FY2025 operating summary plus unrecovered resource proxies',{F:51256141,E:2377336,I:0,L:0,f:1,V:2333500,X:2062111}),
 evaluate('income-unknown-clinical-null','Both clinical null and unknown resources',{u:0},{},true),
 evaluate('favorable','Larger additionality and utility without survival claims',{b:.8,c:.9,a:.8,u:.03},{foodValue:1000,substitutedFood:250,otherConsumption:100,distinctShare:.75}),
 evaluate('poor','Low use, strong substitution and burdens',{b:.1,c:.4,a:.2,u:.002,f:1.5},{foodValue:250,substitutedFood:250,otherConsumption:0,burden:100})
 ];}
export function historicalHealth(p){const costUSD=(p.F+p.E+p.I)*p.f;const allPopulationQalys=Math.min(p.M/p.D,p.N)*p.r*p.a*p.u*p.b;return {costUSD,allPopulationQalys,editionQalys:allPopulationQalys*p.g};}
