import fs from 'node:fs';
import assert from 'node:assert/strict';
export const defaults={E:434,U:217,l:.02,a:.5,b:.25,m:.08,u:.7,T:10,g:.98,C:16203740,h:0,delay:0,r:.03};
const F=(k,t)=>k===0?t:-Math.expm1(-k*t)/k;
export function health(p={}){
 p={...defaults,...p};const {E,U,l,a,b,m,u,T,g,C,h,delay,r}=p;
 if([E,U,l,a,b,m,u,T,g,C,h,delay,r].some(v=>!Number.isFinite(v))||U<=0||T<1||C<0||h<0||delay<0||r<0||[l,a,b,u,g].some(v=>v<0||v>1))throw Error('Invalid health inputs');
 const delta=E/U*l*a,lambda=m-delta,d=Math.log1p(r);if(lambda<0)throw Error('Negative hazard');
 const H=U*u*(F(lambda+d,1)-F(m+d,1)+(Math.exp(-lambda)-Math.exp(-m))*Math.exp(-d)*F(m+d,T-1));
 const all=b*H/(1+r)**delay-h;return {costUSD:C,allPopulationQalys:all,editionQalys:g*all,oneYearAdditionalSurvivors:U*(Math.exp(-lambda)-Math.exp(-m))*b*g};
}
// Same logarithmic flow convention as lib/income-health-equivalence.mjs.
// people is an already additional, common-alive household exposure count.
export function income(p){
 const {people,annualIncomeBeforeUSD:B,annualIncomeGainUSD:G,years,causalShare=1,editionShare=1,independentShare=1,delayYears=0,discountRate=0}=p;
 if([people,B,G,years,causalShare,editionShare,independentShare,delayYears,discountRate].some(v=>!Number.isFinite(v))||people<=0||B<=0||B+G<=0||years<=0||delayYears<0||discountRate<0||[causalShare,editionShare,independentShare].some(v=>v<0||v>1))throw Error('Invalid income inputs');
 if(G<0&&(causalShare!==1||independentShare!==1))throw Error('Negative burdens may not receive a success or overlap haircut');
 let Y=0;for(let i=0;i<Math.ceil(years);i++)Y+=Math.min(1,years-i)/(1+discountRate)**(delayYears+i);
 return .5*people*Y*Math.log1p(G/B)*causalShare*editionShare*independentShare;
}
export const pathway=(gain,people=100,years=1,baseline=10000,delay=0)=>({people,annualIncomeBeforeUSD:baseline,annualIncomeGainUSD:gain,years,causalShare:1,editionShare:.98,independentShare:1,delayYears:delay,discountRate:.03,rationale:gain>=0?'Conditional incremental food/hygiene purchasing-power release for common-alive participants after alternative free provision; no employment or survival-income credit. The already donor-additional exposure count is specified per scenario; the reference 100 assumes 400 exposed people times 25% funding response. No positive overlap haircut.':'Conditional additional participant travel/phone/paperwork cash burden; counted at full weight independent of health success and positive benefits.',counterfactual:'Existing city-funded OnPoint care, free meals/supplies from other SSPs, SNAP/Medicaid and community naloxone remain available. All amounts and additional household counts are judgments, not observed savings.',sourceIds:['services','caseManagement','public26','alternatives','cg']});
export function evaluate(id,label,p,pathways,{unknown=false,assumptions=''}={}){
 const h=health(p),I=unknown?null:pathways.reduce((a,b)=>a+income(b),0),Q=I===null?null:h.editionQalys+I;
 return {id,label,...h,incomeUnknown:unknown,incomePathways:pathways,incomeEquivalentHealthyYears:I,totalWelfareEquivalentHealthyYears:Q,pricePer10HealthQalys:h.editionQalys>0?10*h.costUSD/h.editionQalys:null,pricePer10Qalys:Q>0?10*h.costUSD/Q:null,pricePer10WelfareEquivalent:Q>0?10*h.costUSD/Q:null,assumptions:JSON.stringify({...defaults,...p})+'; '+assumptions};
}
export function scenarios(){const ref=[pathway(300),pathway(-30)];return [
 evaluate('central','Conditional survival and net consumption reference',{},ref,{assumptions:'Two disjoint cohorts: 100 additional common-alive households gain $300 annual consumption net of their own costs; 100 other households incur $30 net cost with no gain, baseline $10,000; one year only. Gains and burdens persist under clinical null. These are uncalibrated welfare priors. Co-occurring gain and costs must be netted within a household before log conversion.'}),
 evaluate('clinical-null','No additional clinical effect; financial pathways persist',{l:0},ref),
 evaluate('financial-only','Clinical null with no purchasing-power gain and full burdens',{l:0},[pathway(0),pathway(-30)]),
 evaluate('zero','No additional program capacity and no induced burden',{b:0},[]),
 evaluate('adverse','Clinical harm plus household losses',{l:0,h:.25},[pathway(-300)]),
 evaluate('unknown','Unresolved net household consumption',{},[],{unknown:true,assumptions:'Missing household cash data cannot establish zero income effect.'}),
 evaluate('consumption-null','No consumption gain; burden remains',{},[pathway(0),pathway(-30)]),
 evaluate('resource','10% unrecognized partner-resource stress',{C:16203740*1.1},ref),
 evaluate('delay','Two-year delayed incremental service capacity',{delay:2},[pathway(300,100,1,10000,2),pathway(-30,100,1,10000,0)]),
 evaluate('income-upper','Conditional larger purchasing-power benefit',{},[pathway(1000,250,2),pathway(-60,250,2)]),
 evaluate('income-lower','Replacement free services eliminate gain; higher cash burden',{},[pathway(0),pathway(-300)]),
 evaluate('geography','80% resident allocation',{g:.8},ref.map(p=>({...p,editionShare:.8})))
 ,evaluate('funding-low','10% ordinary-gift capacity response',{b:.1},[pathway(300,40),pathway(-30,40)],{assumptions:'Clinical and financial additional service exposure scale jointly: 400 eligible gain exposures times10%=40; burden-only exposure 40. Cash loss per actually exposed household has full weight; no clinical-success haircut.'})
 ,evaluate('funding-high','50% ordinary-gift capacity response',{b:.5},[pathway(300,200),pathway(-30,200)],{assumptions:'Clinical and financial additional service exposure scale jointly: 400 eligible gain exposures times50%=200; burden-only exposure 200. Cash loss per actually exposed household has full weight; no clinical-success haircut.'})
 ];}
export function selftest(){
 const original=JSON.parse(fs.readFileSync(new URL('./initial-diagnostic.json',import.meta.url)));
 for(const s of original.report.model.scenarios){const q=health(JSON.parse(s.assumptions));assert.ok(Math.abs(q.editionQalys-s.editionQalys)<1e-10);assert.ok(Math.abs(q.allPopulationQalys-s.allPopulationQalys)<1e-10);}
 const s=scenarios(),ref=s.find(s=>s.id==='central'),nil=s.find(s=>s.id==='clinical-null');assert.equal(ref.incomeEquivalentHealthyYears,nil.incomeEquivalentHealthyYears);assert.equal(nil.editionQalys,0);assert.ok(s.find(s=>s.id==='financial-only').incomeEquivalentHealthyYears<0);assert.equal(s.find(s=>s.id==='zero').totalWelfareEquivalentHealthyYears,0);assert.equal(s.find(s=>s.id==='unknown').incomeEquivalentHealthyYears,null);assert.ok(s.find(s=>s.id==='adverse').totalWelfareEquivalentHealthyYears<0);assert.ok(s.find(s=>s.id==='delay').totalWelfareEquivalentHealthyYears<ref.totalWelfareEquivalentHealthyYears);assert.throws(()=>income({...pathway(-30),independentShare:.5}));assert.throws(()=>health({l:1}));
 console.log(JSON.stringify({passed:true,alphaScenariosReproduced:original.report.model.scenarios.length,scenarioCount:s.length,reference:ref},null,2));
}
if(process.argv.includes('--selftest'))selftest();
