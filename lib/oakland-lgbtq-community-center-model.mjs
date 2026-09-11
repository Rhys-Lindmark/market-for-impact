export const modelVersion='oakland-lgbtq-center-whole-gift-clinical-v1';
export const anchors=Object.freeze({expense:4957230,hivTested:1046,year:2024,ein:'82-2258008'});
const c={unique:.8,prepShare:.2,prepYears:.5,risk:.015,protection:.9,prepAccess:.4,hivUtility:.1,hivYears:10,positive:.01,artLink:.7,artAccess:.5,artUtility:.05,artYears:.5,stiEpisodes:.2,stiTreat:.8,stiSymptom:.3,stiAccess:.5,stiUtility:.1,stiYears:.02,partner:.5,funding:.4,bay:.98,harm:.00005};
export const scenarios=Object.freeze([
{id:'funding_null',weight:.2,...c,funding:0},
{id:'clinical_null',weight:.15,...c,hivUtility:0,artUtility:0,stiUtility:0,harm:0},
{id:'harm',weight:.1,...c,hivUtility:0,artUtility:0,stiUtility:0,harm:.0005},
{id:'cautious',weight:.25,unique:.6,prepShare:.05,prepYears:.25,risk:.005,protection:.7,prepAccess:.2,hivUtility:.05,hivYears:5,positive:.005,artLink:.5,artAccess:.2,artUtility:.02,artYears:.25,stiEpisodes:.1,stiTreat:.5,stiSymptom:.2,stiAccess:.2,stiUtility:.05,stiYears:.01,partner:.3,funding:.2,bay:.95,harm:.0001},
{id:'central',weight:.2,...c},
{id:'favorable',weight:.1,unique:1,prepShare:.4,prepYears:.8,risk:.04,protection:.99,prepAccess:.7,hivUtility:.15,hivYears:20,positive:.02,artLink:.9,artAccess:.7,artUtility:.1,artYears:2,stiEpisodes:.4,stiTreat:.95,stiSymptom:.5,stiAccess:.7,stiUtility:.2,stiYears:.05,partner:.7,funding:.65,bay:1,harm:.00002}
].map(Object.freeze));
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const num=(x,k,lo=0,hi=1)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)throw new RangeError(k);};
const finite=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('derived output');if(x&&typeof x==='object')Object.values(x).forEach(finite);return x;};
const price=(cost,q)=>{const p=q>0?10*cost/q:null;return finite(p);};
export function calculate(options={}){
if(!obj(options))throw new TypeError('options');
const{expense=anchors.expense,gift=10000,tested=anchors.hivTested,worlds=scenarios}=options;
num(expense,'expense',1,1e9);num(gift,'gift',0,10000);num(tested,'tested',0,1e6);
if(!Array.isArray(worlds)||!worlds.length||worlds.length>100)throw new TypeError('worlds');
let mass=0;const ids=new Set();
const rows=worlds.map(s=>{
if(!obj(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id.trim()))throw new TypeError('id');ids.add(s.id.trim());
for(const k of Object.keys(c))num(s[k],k,0,k==='hivYears'?20:k==='artYears'?2:1);num(s.weight,'weight');mass+=s.weight;
const people=tested*s.unique,prepStarts=people*(1-s.positive)*s.prepShare,protectedYears=prepStarts*s.prepYears;
const prevented=protectedYears*s.risk*s.protection*s.prepAccess,prepQ=prevented*s.hivUtility*s.hivYears;
const artStarts=people*s.positive*s.artLink,artQ=artStarts*s.artAccess*s.artUtility*s.artYears;
const stiCompleted=people*s.stiEpisodes*s.stiTreat,stiQ=stiCompleted*s.stiSymptom*s.stiAccess*s.stiUtility*s.stiYears;
const harmQ=people*s.harm,annualQ=(prepQ+artQ+stiQ-harmQ)*s.partner*s.funding,annualBayQ=annualQ*s.bay;
return finite({...s,people,prepStarts,protectedYears,prevented,prepQ,artStarts,artQ,stiCompleted,stiQ,harmQ,annualQ,annualBayQ,giftBayQ:annualBayQ*gift/expense,bayCostPer10:price(expense,annualBayQ)});
});
if(Math.abs(mass-1)>1e-10)throw new RangeError('weights');
const annualQ=rows.reduce((a,s)=>a+s.weight*s.annualQ,0),annualBayQ=rows.reduce((a,s)=>a+s.weight*s.annualBayQ,0);
finite({annualQ,annualBayQ});const f=rows.find(x=>x.id==='favorable'),others=rows.filter(x=>x.id!=='favorable'),m=others.reduce((a,s)=>a+s.weight,0),without=m?others.reduce((a,s)=>a+s.weight*s.annualBayQ,0)/m:0;
return finite({modelVersion,anchors,expense,gift,tested,rows,annualQ,annualBayQ,giftBayQ:annualBayQ*gift/expense,bayCostPer10:price(expense,annualBayQ),allCostPer10:price(expense,annualQ),favorableShare:annualBayQ>0&&f?f.weight*f.annualBayQ/annualBayQ:null,withoutFavorableBayCostPer10:price(expense,without),subjectiveMassBelow1m:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e6?s.weight:0),0),subjectiveMassBelow100k:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e5?s.weight:0),0),verifiedMarginalPrice:null,completeResourcePrice:null});
}
