import {incomeHealthyYearEquivalent as bridge} from './income-health-equivalence.mjs';
const add=(a,b)=>a===null||b===null?null:a+b;
const excluded=new Set(['eye','crc','gi_symptom_diagnosis','breast_diagnostic','gyne_diagnostic','skin_lesion','other_assessment','degenerative_knee','gallstone']);

// All incidence shares describe households, not reductions to everybody's dollars.
// Clinical onset is already conditioned alive; only subsequent common-alive
// midpoint survival belongs in these one-year household flows.
export function resourceLedger(p,paths,{known,inactive}){
 const unmet=1-p.buyer-p.free;
 const cashAbsent=p.cashKnown&&p.travel===0&&(p.buyer===0||p.paidPrice===0)&&(unmet===0||p.medicine===0);
 const payAbsent=p.worker===0||unmet===0||(p.payKnown&&(p.netDay===0||(p.lostDays===0&&p.recoveredDays===0)));
 if(inactive||!known){return{cash:inactive||cashAbsent?0:null,pay:inactive||payAbsent?0:null,rawCash:inactive||cashAbsent?0:null,rawPay:inactive||payAbsent?0:null,rows:[],cashFlows:[],payFlows:[],knownFlows:[],knownMoneyComponents:[]};}
 const rows=[],cashFlows=[],payFlows=[],knownFlows=[],knownMoneyComponents=[];
 let cash=0,pay=0,rawCash=0,rawPay=0;
 for(const x of paths)for(const[cohort,share]of [['buyer',p.buyer],['free',p.free],['unmet',unmet]]){
  if(!share||!x.people)continue;
  const medicationRoute=cohort==='unmet'&&!excluded.has(x.id);
  const recoveryRoute=cohort==='unmet'&&x.id==='general_cyst';
  const responseRoute=medicationRoute||recoveryRoute;
  const responses=!responseRoute?[[null,1]]:p.responseKnown?[[true,x.treatment_success],[false,1-x.treatment_success]]:[[null,1]];
  for(const[success,probability]of responses)for(const[worker,employmentShare]of [[true,p.worker],[false,1-p.worker]]){
   const people=x.people*share*probability*employmentShare;if(!people)continue;
   const commonAlivePeople=people*Math.exp(-x.mortality_hazard*.5);
   const time=p.resourceDelay+.5,discount=(1+p.resourceDiscount)**time;
   let baseline=p.baseline;
   const increments=[];
   // Never net a negative burden into a favorable flow before overlap adjustment.
   const travel=p.cashKnown?-p.travel*1529/1130:null;
   const buyer=cohort==='buyer'?(p.cashKnown?p.paidPrice:null):0;
   const medicine=!medicationRoute||success===false||(p.cashKnown&&p.medicine===0)?0:!p.cashKnown||success===null?null:p.medicine;
   const lost=cohort==='unmet'&&worker?(p.payKnown?-p.netDay*p.lostDays:null):0;
   const recovery=!recoveryRoute||!worker||success===false||(p.payKnown&&(p.netDay===0||p.recoveredDays===0))?0:!p.payKnown||success===null?null:p.netDay*p.recoveredDays;
   for(const[kind,role,gain]of [['cash','travel',travel],['cash','buyerSaving',buyer],['cash','medicine',medicine],['pay','lostPay',lost],['pay','recoveryPay',recovery]]){
    const retention=role==='buyerSaving'?1:p.positiveIndependent;
    const omittedPositiveRecovery=gain===null&&role==='recoveryPay'&&p.payKnown&&p.recoveredDays>=0&&p.positiveIndependent===0;
    let equivalent=null,flow=null;
    if(gain===0||omittedPositiveRecovery)equivalent=0;
    else if(gain!==null&&baseline!==null){
     if(baseline<=0||baseline+gain<=0)throw RangeError('Household consumption');
     flow={kind,role,people:commonAlivePeople,annualIncomeBeforeUSD:baseline,annualIncomeGainUSD:gain,years:1,delayYears:time,discountRate:p.resourceDiscount,independentShare:gain>0?retention:1};
     equivalent=bridge(flow);knownFlows.push(flow);(kind==='cash'?cashFlows:payFlows).push(flow);
    }
    const dollars=gain===null?null:commonAlivePeople*gain/discount;
    if(kind==='cash'){cash=add(cash,equivalent);rawCash=add(rawCash,dollars);}else{pay=add(pay,equivalent);rawPay=add(rawPay,dollars);}
    if(dollars!==null)knownMoneyComponents.push({path:x.id,cohort,success,worker,role,presentValueUSD:dollars,equivalent});
    increments.push({kind,role,gainUSD:gain,beforeUSD:baseline,equivalent});
    baseline=gain===null||baseline===null?null:baseline+gain;
   }
   rows.push({path:x.id,cohort,success,worker,people,commonAlivePeople,afterUSD:baseline,increments});
  }
 }
 // Population absence is independent of unavailable monetary magnitudes.
 if(payAbsent){pay=0;rawPay=0;}
 return{cash,pay,rawCash,rawPay,rows,cashFlows,payFlows,knownFlows,knownMoneyComponents};
}
