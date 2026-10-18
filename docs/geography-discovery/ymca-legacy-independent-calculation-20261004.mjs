// Independent numerical reconstruction, no author/shared helper imports.
export const allocation={fitness:.2,mental:.25,family:.2,dpp:.05,youth:.15,aquatics:.05,campOther:.1};
const common={a:.4,ra:.4,u:0,T:1,d:0,healthIndependent:1,harm:0,sf:.65,hsf:.65,unique:1,resourceFraction:1,B:50000,R:1,rd:0,positiveIndependent:1,access:0,pay:0,transfer:0,medical:0,fees:0,travel:0,care:0,lostPay:0,displacement:0,external:null};
const base={fitness:{C:600,u:.027*.2,d:.75},mental:{C:1500},family:{C:500,sf:1,hsf:1},dpp:{C:600,u:.08*.3*.05,T:2,d:3},youth:{C:1500},aquatics:{C:250},campOther:{C:1000}};
const all=k=>Object.fromEntries(Object.keys(base).map(n=>[n,k]));
export const cases={central:{},nullAdditionality:{routes:all({a:0})},nullClinical:{routes:all({u:0})},therapyConditional:{routes:{mental:{u:.02,T:.5}}},legacyFamilyUtilityConditional:{routes:{family:{u:.004,T:.25}}},familyFoodAccessConditional:{routes:{family:{access:100,travel:20,care:10}}},youthChildcareSubstitution:{routes:{youth:{access:500,fees:100,travel:50,care:25}}},youthActualTakeHomePay:{routes:{youth:{pay:500,fees:100,travel:50,care:25}}},feeReliefNoNewClinicalAccess:{routes:{aquatics:{a:0,ra:1,access:51}}},swimPriceSubstitution:{routes:{aquatics:{access:216,fees:165,travel:20,care:10}}},medicalOutOfPocketConditional:{routes:{dpp:{medical:100,rd:3}}},familyNetTransferConditional:{routes:{family:{transfer:100,displacement:50,travel:20}}},participationBurdens:{routes:all({travel:20,care:20,lostPay:20})},positiveOverlapZeroBurdenRetained:{routes:{family:{access:100,positiveIndependent:0,travel:20,care:10}}},mixedPositiveGrossNegativeNet:{routes:{youth:{pay:1,fees:10}}},negativeClinical:{routes:{mental:{u:-.01},family:{harm:.005}}},healthOverlapHalf:{routes:{fitness:{healthIndependent:.5},dpp:{healthIndependent:.5}}},nullWithIndependentHarm:{routes:all({a:0}),harmSF:.1,harmRest:.1,induced:1,inducedNet:-100},knownConditionalGross:{routes:all({external:0})},partialKnownGross:{routes:{fitness:{external:100}}},distinctHouseholdGeography:{routes:{family:{access:100,sf:.5,hsf:1},youth:{access:100,hsf:.4}}},campFiniteAccessConditional:{routes:{campOther:{access:100,travel:30,care:20}}},aquaticsFiniteClinicalConditional:{routes:{aquatics:{u:.001,T:.25,harm:.0001}}},zeroGift:{G:0},smallGift:{G:1000},dppNoEffect:{routes:{dpp:{u:0}}},clinicalDelay:{routes:{fitness:{d:1},dpp:{d:4}}}};
export function reconstruct(o={}){
const G=o.G??100000,discount=o.discount??.03,D=t=>(1+discount)**(-t);
// Explicit annual exposure pieces, independently represented as year cells.
const exposure=(T,d)=>{let sum=0,t=0;while(t<T){sum+=Math.min(1,T-t)*D(d+t);t++;}return sum;};
let sf=-(o.harmSF??0),rest=-(o.harmRest??0),cashSF=0,cashRest=0,external=0,unknown=false;const routes={};
for(const k of Object.keys(base)){const r={...common,...base[k],...o.routes?.[k]},funded=G*allocation[k]/r.C,n=funded*r.a,hh=funded*r.ra*r.unique*r.resourceFraction;
const signedU=r.u>0?r.u*r.healthIndependent:r.u;
const h=n*(signedU*(k==='fitness'?D(r.d):exposure(r.T,r.d))-r.harm);
const rows=[r.access,r.pay,r.transfer,r.medical,-r.fees,-r.travel,-r.care,-r.lostPay,-r.displacement];
const net=rows.map(v=>v>0?v*r.positiveIndependent:v).reduce((a,b)=>a+b,0);
const money=.5*hh*exposure(r.R,r.rd)*Math.log1p(net/r.B);
sf+=h*r.sf;rest+=h*(1-r.sf);cashSF+=money*r.hsf;cashRest+=money*(1-r.hsf);
if(r.external===null&&funded>0)unknown=true;else if(r.external!==null)external+=funded*r.external;
routes[k]={funded,n,hh,net,health:h,money};}
const induced=.5*(o.induced??0)*Math.log1p((o.inducedNet??0)/50000);cashSF+=induced*.65;cashRest+=induced*.35;
const geo=(h,i)=>({health:h,money:i,total:h+i,price:h+i>0?10*G/(h+i):null});
return {routes,induced,floor:G+external,gross:unknown?null:G+external,sf:geo(sf,cashSF),restBay:geo(rest,cashRest),bay:geo(sf+rest,cashSF+cashRest)};
}
export const results=Object.fromEntries(Object.entries(cases).map(([k,o])=>[k,reconstruct(o)]));
if(process.argv[1]?.endsWith('ymca-legacy-independent-20261004-calculate.mjs'))console.log(JSON.stringify({caseCount:Object.keys(results).length,results},null,2));
