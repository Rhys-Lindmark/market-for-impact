export const anchors=Object.freeze({expense:1371759,slots:165,methadoneRateDifference:.0248,buprenorphineRateDifference:.0052});
const c={occupancy:.75,methadone:.8,access:.3,funding:.1,transfer:.45,bay:.95,horizon:10,survival:.93,utility:.7,discount:.03,harm:.0002};
export const worlds=Object.freeze([
 {id:'funding_null',weight:.4,...c,funding:0},
 {id:'clinical_null',weight:.15,...c,transfer:0,harm:0},
 {id:'harm',weight:.1,...c,transfer:0,harm:.003},
 {id:'cautious',weight:.15,...c,occupancy:.5,methadone:.5,access:.1,funding:.05,transfer:.2,bay:.85,horizon:5,survival:.85,utility:.65,harm:.0005},
 {id:'central',weight:.15,...c},
 {id:'favorable',weight:.05,...c,occupancy:1,methadone:1,access:.6,funding:.5,transfer:.7,bay:1,horizon:20,survival:.96,utility:.8,harm:.0001}
].map(Object.freeze));
function bound(x,a,b,k){if(typeof x!=='number'||!Number.isFinite(x)||x<a||x>b)throw new RangeError(k);}
export function calculate(options={}){
 if(options===null||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const {gift=10000,expense=anchors.expense,scenarios=worlds}=options;
 bound(gift,0,10000,'gift');bound(expense,1,1e10,'expense');
 if(!Array.isArray(scenarios)||!scenarios.length)throw new TypeError('worlds');
 let mass=0;const ids=new Set();
 for(const s of scenarios){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('id');ids.add(s.id);
 for(const k of ['weight','occupancy','methadone','access','funding','transfer','bay','survival','utility','discount'])bound(s[k],0,1,k);
 bound(s.horizon,1,20,'horizon');if(!Number.isInteger(s.horizon))throw new RangeError('integer horizon');bound(s.harm,0,.1,'harm');mass+=s.weight;}
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weights');
 const rows=scenarios.map(s=>{let survivalQ=0;for(let t=1;t<=s.horizon;t++)survivalQ+=s.utility*s.survival**(t-.5)/(1+s.discount)**t;
 const treatmentYears=anchors.slots*s.occupancy;
 const addedTreatmentYears=gift/expense*treatmentYears*s.access*s.funding;
 const rate=s.methadone*anchors.methadoneRateDifference+(1-s.methadone)*anchors.buprenorphineRateDifference;
 const netDeaths=addedTreatmentYears*(rate*s.transfer-s.harm);
 const bayQ=netDeaths*survivalQ*s.bay;
 const row={...s,survivalQ,treatmentYears,addedTreatmentYears,netDeaths,bayQ,costPer10:bayQ>0?gift*10/bayQ:null};
 for(const v of Object.values(row))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Row numerical overflow');
 return row;});
 const bayQ=rows.reduce((a,r)=>a+r.weight*r.bayQ,0),tail=rows.find(r=>r.id==='favorable');
 const result={gift,expense,rows,bayQ,bayCostPer10:bayQ>0?gift*10/bayQ:null,favorableShare:bayQ>0&&tail?tail.weight*tail.bayQ/bayQ:null,verifiedMarginalPrice:null,completeResourcePrice:null};
 for(const v of Object.values(result))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Aggregate numerical overflow');
 return result;
}
