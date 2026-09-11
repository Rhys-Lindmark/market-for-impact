export const modelVersion='svbc-whole-gift-v1',wholeExpense=1844918;
const c={deaths:.5,injuries:10,reduction:.2,years:3,lag:2,attribution:.1,funding:.3,bay:.95,lifeYears:10,utility:.8,hazard:.03,injuryUtility:.2,injuryYears:1};
export const worlds=Object.freeze([{id:'funding_null',weight:.25,...c,funding:0},{id:'implementation_null',weight:.2,...c,reduction:0},{id:'adverse_design',weight:.1,...c,reduction:-.05},{id:'cautious',weight:.2,deaths:.1,injuries:3,reduction:.1,years:1,lag:3,attribution:.03,funding:.1,bay:.9,lifeYears:5,utility:.7,hazard:.05,injuryUtility:.1,injuryYears:.5},{id:'central',weight:.2,...c},{id:'favorable',weight:.05,deaths:2,injuries:30,reduction:.4,years:5,lag:1,attribution:.25,funding:.6,bay:.98,lifeYears:15,utility:.85,hazard:.02,injuryUtility:.3,injuryYears:2}].map(Object.freeze));
const f=(v,k,min=0,max=Number.MAX_VALUE)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new RangeError(k);return v;};
export const annuity=(years,rate)=>rate===0?years:-Math.expm1(-rate*years)/rate;
const price=(q,g)=>q>0&&g>0?f(10/(q/g),'price'):null;
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const {gift=1000,expense=wholeExpense,scenarios=worlds}=options;f(gift,'gift',0,10000);f(expense,'expense',Number.MIN_VALUE);
 if(!Array.isArray(scenarios)||!scenarios.length)throw new TypeError('scenarios');let weight=0;const ids=new Set(),discount=Math.log(1.03);
 const rows=scenarios.map(w=>{if(!w||typeof w!=='object'||Array.isArray(w)||typeof w.id!=='string'||!w.id.trim()||ids.has(w.id.trim()))throw new TypeError('world');w={...w,id:w.id.trim()};ids.add(w.id);
 for(const k of ['weight','attribution','funding','bay','utility','injuryUtility','hazard'])f(w[k],k,0,1);f(w.reduction,'reduction',-1,1);
 for(const k of ['deaths','injuries'])f(w[k],k);for(const k of ['years','lag','lifeYears','injuryYears'])f(w[k],k,0,30);weight+=w.weight;
 const deathQ=f(w.utility*annuity(w.lifeYears,w.hazard+discount),'deathQ'),injuryQ=f(w.injuryUtility*annuity(w.injuryYears,discount),'injuryQ');
 const exposure=f(Math.exp(-discount*w.lag)*annuity(w.years,discount),'exposure');
 const grossQ=f((w.deaths*deathQ+w.injuries*injuryQ)*w.reduction*exposure,'grossQ',-Number.MAX_VALUE);
 const allQ=f(gift/expense*w.attribution*w.funding*grossQ,'allQ',-Number.MAX_VALUE),bayQ=f(allQ*w.bay,'bayQ',-Number.MAX_VALUE);
 return {...w,deathQ,injuryQ,exposure,grossQ,allQ,bayQ,bayCostPer10:price(bayQ,gift)};});
 if(Math.abs(weight-1)>1e-10)throw new RangeError('weights');const allQ=f(rows.reduce((s,w)=>s+w.weight*w.allQ,0),'allQ',-Number.MAX_VALUE),bayQ=f(rows.reduce((s,w)=>s+w.weight*w.bayQ,0),'bayQ',-Number.MAX_VALUE);const fav=rows.find(w=>w.id==='favorable'),withoutWeight=1-(fav?.weight||0),withoutQ=withoutWeight?f((bayQ-(fav?fav.weight*fav.bayQ:0))/withoutWeight,'withoutQ',-Number.MAX_VALUE):0;
 return {modelVersion,gift,expense,rows,allQ,bayQ,bayCostPer10:price(bayQ,gift),central:rows.find(w=>w.id==='central')||null,withoutFavorableBayCostPer10:price(withoutQ,gift),favorableShare:bayQ>0&&fav?f(fav.weight*fav.bayQ/bayQ,'favorableShare',-Number.MAX_VALUE):null,subjectiveMassBelow1m:rows.reduce((s,w)=>s+(w.bayCostPer10!==null&&w.bayCostPer10<1e6?w.weight:0),0),subjectiveMassBelow100k:rows.reduce((s,w)=>s+(w.bayCostPer10!==null&&w.bayCostPer10<1e5?w.weight:0),0)};
}
