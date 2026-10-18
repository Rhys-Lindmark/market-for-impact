// Isolated candidate. Configure BREATHE_REPO after integration; legacy files remain untouched.
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const repo=process.env.BREATHE_REPO||'/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta';
const moduleAt=p=>import(pathToFileURL(`${repo}/lib/${p}`).href);
const [{BASE,FINANCE,calculate:legacy},{calculate:clinical},{incomeHealthyYearEquivalent:bridge},{calculate:foundationClinical}]=await Promise.all(['breathe-v2-model.mjs','breathe-v2-core.mjs','income-health-equivalence.mjs','breathe-v2-foundation.mjs'].map(moduleAt));
export const version='breathe-signed-household-candidate-2026-10-04';
export const reference={baselineIncomeUSD:50000,cashIndependentShare:1,householdKnown:false,tobaccoNetAnnualUSD:0,cpapPurchaseReplacementShare:0,cpapReplacementNetUSD:0,cessation:{earnings:0,care:0,fee:0,travel:0,treatment:0},asthma:{earnings:0,care:0,fee:0,travel:0,treatment:0},cpap:{earnings:0,care:0,fee:0,travel:0,treatment:0}};
const probability=v=>Number.isFinite(v)&&v>=0&&v<=1;
const price=(c,q)=>c>0&&q>0?10*c/q:null;
export function calculate({gift=100000,foundation={},inputs={},household={},resourceMultiplier=1,independentHarmUS=0,harmBayShare=.8,harmSFShare=.05}={}){
 if(!Number.isFinite(gift)||gift<0||gift>100000||!Number.isFinite(resourceMultiplier)||resourceMultiplier<1||resourceMultiplier>1000||!Number.isFinite(independentHarmUS)||independentHarmUS<0||independentHarmUS>1e8||![harmBayShare,harmSFShare].every(probability)||harmSFShare>harmBayShare)throw Error('cost/harm/geography');
 for(const key of Object.keys(foundation))if(!Object.hasOwn(BASE.foundation,key)||key==='gift_usd')throw Error('foundation key');
 for(const key of Object.keys(inputs))if(!Object.hasOwn(BASE.inputs,key))throw Error('input key');
 for(const key of Object.keys(household))if(!Object.hasOwn(reference,key))throw Error('household key');
 const p={...BASE.foundation,...foundation,gift_usd:gift},x={...BASE.inputs,...inputs};
 const j={...reference,...household};
 if(!Number.isFinite(j.baselineIncomeUSD)||j.baselineIncomeUSD<=0||!Number.isFinite(j.tobaccoNetAnnualUSD)||j.tobaccoNetAnnualUSD<=-j.baselineIncomeUSD||!probability(j.cashIndependentShare)||typeof j.householdKnown!=='boolean')throw Error('household domain');
 const raw=clinical({foundation:p,inputs:x});
 const cessCash={...reference.cessation,...j.cessation};
 if(j.tobaccoNetAnnualUSD!==0&&Object.values(cessCash).some(v=>v!==0))throw Error('joint cessation tobacco/cash needs a combined household distribution');
 const cPeople=gift*p.cessation_allocation/p.cessation_cash_per_offer*p.cessation_additionality;
 const aPeople=gift*p.asthma_allocation/p.asthma_cash_per_offer*p.asthma_additionality;
 const cEpisodes=raw.cpap_additional_episodes;
 const perQuit=legacy({gift,worlds:[{id:'central',weight:1,foundation,inputs}]}).central;
 // Signed cash components are net AFTER tax/benefit offsets; fee/travel/treatment are losses.
 // Compute log welfare on each household's TOTAL change, never add logs by category.
 const rows=[];
 for(const [id,people,delay,bay,sf] of [['cessation',cPeople,p.cessation_delay,p.cessation_bay_share,p.cessation_sf_share],['asthma',aPeople,p.asthma_delay,p.asthma_bay_share,p.asthma_sf_share],['cpap',cEpisodes,x.cpap_delay,x.cpap_bay_share,x.cpap_sf_share]]){
  const cash={...reference[id],...j[id]};
  for(const [k,v] of Object.entries(cash))if(!Object.hasOwn(reference[id],k)||!Number.isFinite(v)||(['fee','travel','treatment'].includes(k)&&v<0))throw Error('cash component');
  const net=cash.earnings+cash.care-cash.fee-cash.travel-cash.treatment;
  if(net<=-j.baselineIncomeUSD)throw Error('nonpositive remaining income');
  const q=people===0?0:bridge({people,annualIncomeBeforeUSD:j.baselineIncomeUSD,annualIncomeGainUSD:net,years:1,independentShare:1,delayYears:delay,discountRate:p.discount});
  rows.push({id,people,cash,netHouseholdUSD:people*net,rawCashEquivalent:q,positiveCashEquivalent:Math.max(q,0),negativeCashEquivalent:Math.min(q,0),oneYearCashEquivalent:Math.max(q,0)*j.cashIndependentShare+Math.min(q,0),bayShare:bay,sfShare:sf});
 }
 if(!probability(j.cpapPurchaseReplacementShare)||j.cpapPurchaseReplacementShare+x.cpap_additionality>1+1e-12||!Number.isFinite(j.cpapReplacementNetUSD)||j.cpapReplacementNetUSD<=-j.baselineIncomeUSD)throw Error('replacement incidence or net');
 const replacementPeople=raw.cpap_nominal_episodes*j.cpapPurchaseReplacementShare;
 const replacementQ=replacementPeople===0?0:bridge({people:replacementPeople,annualIncomeBeforeUSD:j.baselineIncomeUSD,annualIncomeGainUSD:j.cpapReplacementNetUSD,years:1,independentShare:1,delayYears:x.cpap_delay,discountRate:p.discount});
 rows.push({id:'cpap-financing-replacement',people:replacementPeople,cash:{netAfterFeesTravelCare:j.cpapReplacementNetUSD},netHouseholdUSD:replacementPeople*j.cpapReplacementNetUSD,rawCashEquivalent:replacementQ,positiveCashEquivalent:Math.max(replacementQ,0),negativeCashEquivalent:Math.min(replacementQ,0),oneYearCashEquivalent:Math.max(replacementQ,0)*j.cashIndependentShare+Math.min(replacementQ,0),bayShare:x.cpap_bay_share,sfShare:x.cpap_sf_share});
 // Tobacco spending counts only initial extra quits while abstinence differs among
 // common survivors. Both arms quit/relapse; no wages or consumption of extra survivors.
 // Annual net excludes replacement products and foregone tobacco enjoyment by judgment.
 let rawTobacco=0,abstinentPersonYears=0;
 for(let year=0;year<Math.ceil(p.cessation_horizon);year++){
  const span=Math.min(1,p.cessation_horizon-year),haz=p.background_quit_hazard+p.relapse_hazard+p.smoking_mortality;
  const exposure=haz===0?span:Math.exp(-haz*year)*(-Math.expm1(-haz*span))/haz;
  const people=cPeople*Math.abs(p.extra_six_month_quit)*exposure;
  abstinentPersonYears+=Math.sign(p.extra_six_month_quit)*people;
  if(people>0)rawTobacco+=Math.sign(p.extra_six_month_quit)*bridge({people,annualIncomeBeforeUSD:j.baselineIncomeUSD,annualIncomeGainUSD:j.tobaccoNetAnnualUSD,years:1,independentShare:1,delayYears:p.cessation_delay+year,discountRate:p.discount});
 }
 const tobaccoPositive=Math.max(rawTobacco,0),tobaccoNegative=Math.min(rawTobacco,0),tobacco=tobaccoPositive*j.cashIndependentShare+tobaccoNegative;
 const f=foundationClinical(p);
 // Clinical effects are unchanged by CASH welfare overlap. Split signed clinical
 // gains and explicit harms for audit before summing; debit each harm once only.
 const healthComponents=[
  {id:'cessation',signedEffect:f.cessation_net_qaly+cPeople*p.cessation_harm_per_added_offer,offerHarm:cPeople*p.cessation_harm_per_added_offer,bayShare:p.cessation_bay_share,sfShare:p.cessation_sf_share},
  {id:'child-asthma',signedEffect:f.asthma_net_qaly+aPeople*p.asthma_harm_per_added_offer,offerHarm:aPeople*p.asthma_harm_per_added_offer,bayShare:p.asthma_bay_share,sfShare:p.asthma_sf_share},
  {id:'adult-asthma',signedEffect:raw.adult_asthma_net_qaly,offerHarm:0,bayShare:p.asthma_bay_share,sfShare:p.asthma_sf_share},
  {id:'cpap',signedEffect:raw.cpap_net_qaly,offerHarm:0,bayShare:x.cpap_bay_share,sfShare:x.cpap_sf_share},
 ].map(c=>({...c,positiveQaly:Math.max(c.signedEffect,0),negativeQaly:Math.min(c.signedEffect,0)}));
 const ledgers={};
 for(const geo of ['us','bay','sf']){
  const share=geo==='us'?1:p['cessation_'+geo+'_share'];
  const income=rows.reduce((s,r)=>s+r.oneYearCashEquivalent*(geo==='us'?1:r[geo+'Share']),0)+tobacco*share;
  const geoShare=c=>geo==='us'?1:c[geo+'Share'];
  const healthPositiveQaly=healthComponents.reduce((s,c)=>s+c.positiveQaly*geoShare(c),0),healthNegativeQaly=healthComponents.reduce((s,c)=>s+c.negativeQaly*geoShare(c),0);
  const explicitClinicalHarmQaly=healthComponents.reduce((s,c)=>s+c.offerHarm*geoShare(c),0)+p.independent_harm_q*(geo==='us'?1:p['harm_'+geo+'_share'])+independentHarmUS*(geo==='us'?1:geo==='bay'?harmBayShare:harmSFShare);
  const health=healthPositiveQaly+healthNegativeQaly-explicitClinicalHarmQaly;
  const householdPositiveBeforeCredit=rows.reduce((s,r)=>s+r.positiveCashEquivalent*geoShare(r),0)+tobaccoPositive*share,householdNegativeFull=rows.reduce((s,r)=>s+r.negativeCashEquivalent*geoShare(r),0)+tobaccoNegative*share;
  const subtotal=health+income;
  ledgers[geo]={healthQaly:health,healthPositiveQaly,healthNegativeQaly,explicitClinicalHarmQaly,householdPositiveBeforeCredit,householdNegativeFull,householdEquivalentYears:income,quantifiedSubtotal:subtotal,conditionalDonorPer10:price(gift,subtotal),conditionalPartialResourcePer10:price(raw.gross_partial_resource_usd*resourceMultiplier,subtotal),wholeOrganizationEquivalentYears:null,wholeOrganizationPrice:null};
 }
 const native={additionalInitialQuits:cPeople*p.extra_six_month_quit,childSymptomFreeDays:aPeople*p.asthma_child_fraction*p.asthma_extra_symptom_free_days*p.asthma_transfer,adultSymptomFreeDays:aPeople*(1-p.asthma_child_fraction)*x.adult_asthma_homevisit_fraction*x.adult_asthma_days_per_fortnight/14*365*x.adult_asthma_transfer,additionalCPAPEpisodes:cEpisodes};
 return {version,gift,annualExpenseBoundary:FINANCE.whole,rankingStatistic:'conditional central quantified subtotal; not empirical EV',householdStatus:j.householdKnown?'user-supplied known conditional cash':'unknown; zero reference is not evidence of zero',unquantifiedShare:1-p.cessation_allocation-p.asthma_allocation-x.cpap_allocation,ledgers,native,nativeWholeGiftUSDPerOutcome:Object.fromEntries(Object.entries(native).map(([k,v])=>[k,v>0?gift/v:null])),healthComponents,overlapMechanism:'cash-positive welfare independence only; clinical unchanged; adverse cash retained fully',cashIndependentShare:j.cashIndependentShare,householdRows:rows,tobacco:{abstinentPersonYears,rawEquivalentYears:rawTobacco,positiveEquivalentBeforeCredit:tobaccoPositive,negativeEquivalentFull:tobaccoNegative,equivalentYears:tobacco,netAnnualUSD:j.tobaccoNetAnnualUSD},partialResourcesUSD:raw.gross_partial_resource_usd*resourceMultiplier,clinicalRaw:perQuit};
}
export function diagnostics(){
 const zeroHealth={extra_six_month_quit:0,asthma_extra_symptom_free_days:0};
 const noClinical={cpap_qaly_one_year:0,adult_asthma_days_per_fortnight:0};
 return {central:calculate(),zeroGift:calculate({gift:0}),completeNull:calculate({foundation:zeroHealth,inputs:noClinical}),replacement:calculate({foundation:{cessation_additionality:0,asthma_additionality:0},inputs:{cpap_additionality:0}}),harm:calculate({foundation:{extra_six_month_quit:-.005},inputs:{cpap_qaly_one_year:-.02,adult_asthma_days_per_fortnight:-1},household:{cpap:{fee:100,travel:50}}}),costStress:calculate({resourceMultiplier:2}),deliveryCostStress:calculate({foundation:{cessation_cash_per_offer:500,asthma_cash_per_offer:2400},inputs:{cpap_cash_per_episode:1000}}),noDiscount:calculate({foundation:{discount:0}}),zeroCashCredit:calculate({household:{cashIndependentShare:0}}),zeroCashCreditIndependentHarm:calculate({household:{cashIndependentShare:0},independentHarmUS:.01}),noSF:calculate({foundation:{cessation_sf_share:0,asthma_sf_share:0},inputs:{cpap_sf_share:0}}),tobaccoSaving:calculate({household:{tobaccoNetAnnualUSD:1500}}),tobaccoLoss:calculate({household:{tobaccoNetAnnualUSD:-500}}),cpapPurchaseSaving:calculate({household:{cpapPurchaseReplacementShare:.25,cpapReplacementNetUSD:350}}),cpapBurden:calculate({household:{cpap:{fee:100,travel:50,treatment:100}}}),adultLostWork:calculate({household:{asthma:{earnings:-100,care:50}}}),nullHealthPositiveCash:calculate({foundation:zeroHealth,inputs:noClinical,household:{cpapPurchaseReplacementShare:.25,cpapReplacementNetUSD:350}}),lowerCPAP:calculate({inputs:{cpap_qaly_one_year:-.034}}),upperCPAP:calculate({inputs:{cpap_qaly_one_year:.044}})};
}
export function test(){
 const checks=[],close=(actual,expected,label)=>{assert(Math.abs(actual-expected)<=1e-12*Math.max(1,Math.abs(expected)),label);checks.push(label);};
 const d=diagnostics();
 close(d.zeroGift.ledgers.us.quantifiedSubtotal,0,'zero gift');
 close(d.completeNull.ledgers.us.quantifiedSubtotal,0,'complete clinical null');
 close(d.replacement.ledgers.us.quantifiedSubtotal,0,'complete replacement');
 close(d.zeroCashCredit.ledgers.us.healthQaly,d.central.ledgers.us.healthQaly,'cash credit zero leaves clinical health unchanged');
 close(d.zeroCashCreditIndependentHarm.ledgers.us.healthQaly,d.central.ledgers.us.healthQaly-.01,'independent harm debited once');
 close(d.noSF.ledgers.sf.quantifiedSubtotal,0,'SF inclusion zero');
 assert(d.harm.ledgers.us.quantifiedSubtotal<0);checks.push('joint harm signed');
 assert.equal(d.harm.ledgers.us.conditionalDonorPer10,null);checks.push('harm price null');
 assert(d.nullHealthPositiveCash.ledgers.us.householdEquivalentYears>0);checks.push('null health positive cash');
 assert(d.deliveryCostStress.ledgers.us.quantifiedSubtotal<d.central.ledgers.us.quantifiedSubtotal);checks.push('delivery cost stress');
 close(d.costStress.ledgers.us.quantifiedSubtotal,d.central.ledgers.us.quantifiedSubtotal,'resource cost stress does not alter outcomes');
 assert.equal(d.central.ledgers.us.wholeOrganizationPrice,null);checks.push('unknown full price');
 for(const [o,label] of [[{inputs:{cpap_sf_share:.9}},'SF exceeds Bay rejected'],[{household:{cpap:{fee:50000}}},'nonpositive remaining income rejected'],[{household:{tobaccoNetAnnualUSD:NaN}},'NaN rejected'],[{household:{nonoverlapShare:0}},'ambiguous old overlap parameter rejected'],[{household:{cashIndependentShare:1.1}},'cash credit above1 rejected']]){assert.throws(()=>calculate(o));checks.push(label);}
 const zf={extra_six_month_quit:0,asthma_extra_symptom_free_days:0},zi={cpap_qaly_one_year:0,adult_asthma_days_per_fortnight:0};
 const negativeCases=[
  ['cessation-health',{foundation:{...zf,extra_six_month_quit:-.03},inputs:zi},'healthQaly'],
  ['child-asthma-health',{foundation:{...zf,asthma_extra_symptom_free_days:-24.4},inputs:zi},'healthQaly'],
  ['adult-asthma-health',{foundation:zf,inputs:{...zi,adult_asthma_days_per_fortnight:-2.02}},'healthQaly'],
  ['cpap-health',{foundation:zf,inputs:{...zi,cpap_qaly_one_year:-.034}},'healthQaly'],
  ...['cessation','asthma','cpap'].map(id=>[id+'-cash',{foundation:zf,inputs:zi,household:{[id]:{fee:100,travel:50}}},'householdEquivalentYears']),
  ['tobacco-cash',{foundation:{...zf,extra_six_month_quit:.03},inputs:zi,household:{tobaccoNetAnnualUSD:-500}},'householdEquivalentYears'],
  ['financing-replacement-cash',{foundation:zf,inputs:zi,household:{cpapPurchaseReplacementShare:.25,cpapReplacementNetUSD:-350}},'householdEquivalentYears'],
 ];
 for(const [name,o,field] of negativeCases){
  const full=calculate(o);
  assert(full.ledgers.us[field]<0,name+' must produce loss');checks.push(name+' signed');
  for(const credit of [0,.5,1])for(const geo of ['us','bay','sf']){
   const r=calculate({...o,household:{...o.household,cashIndependentShare:credit}});
   close(r.ledgers[geo][field],full.ledgers[geo][field],name+' '+geo+' cash-credit'+credit+' retains full loss');
  }
 }
 const mixed={foundation:{extra_six_month_quit:.03},inputs:{cpap_qaly_one_year:-.034},household:{cessation:{care:100},cpap:{fee:100,travel:50}}};
 const fullMixed=calculate(mixed);
 for(const credit of [0,.5,1])for(const geo of ['us','bay','sf']){
  const r=calculate({...mixed,household:{...mixed.household,cashIndependentShare:credit}}),f=fullMixed.ledgers[geo];
  close(r.ledgers[geo].healthQaly,f.healthQaly,'mixed '+geo+' clinical unchanged at'+credit);
  close(r.ledgers[geo].householdEquivalentYears,f.householdPositiveBeforeCredit*credit+f.householdNegativeFull,'mixed '+geo+' positive credit applied before signed row sum at'+credit);
 }
 for(const geographyShare of [0,.5,1])for(const credit of [0,.5,1]){
  const f={...zf,cessation_bay_share:geographyShare,cessation_sf_share:geographyShare,asthma_bay_share:geographyShare,asthma_sf_share:geographyShare,harm_bay_share:geographyShare,harm_sf_share:geographyShare};
  const x={...zi,cpap_qaly_one_year:-.034,cpap_bay_share:geographyShare,cpap_sf_share:geographyShare};
  const r=calculate({foundation:f,inputs:x,household:{cpap:{fee:100,travel:50},cashIndependentShare:credit}});
  for(const geo of ['bay','sf']){
   close(r.ledgers[geo].healthQaly,r.ledgers.us.healthQaly*geographyShare,'geography'+geographyShare+' '+geo+' clinical loss credit'+credit);
   close(r.ledgers[geo].householdEquivalentYears,r.ledgers.us.householdEquivalentYears*geographyShare,'geography'+geographyShare+' '+geo+' cash loss credit'+credit);
  }
 }
 const harmOptions={foundation:{...zf,cessation_harm_per_added_offer:.01,asthma_harm_per_added_offer:.02,independent_harm_q:.1},inputs:zi,independentHarmUS:.2};
 const offerHarm=calculate(harmOptions),expectedHarm=-(offerHarm.householdRows[0].people*.01+offerHarm.householdRows[1].people*.02+.1+.2);
 for(const credit of [0,.5,1])close(calculate({...harmOptions,household:{cashIndependentShare:credit}}).ledgers.us.healthQaly,expectedHarm,'all explicit harms debited once at'+credit);
 const exact=calculate({foundation:zf,inputs:{...zi,cpap_qaly_one_year:-.034},household:{cpap:{fee:100,travel:50},cashIndependentShare:0}});
 close(exact.ledgers.us.healthQaly,-.35891470279133525,'reviewer reproduced CPAP loss at zero cash credit');
 close(exact.ledgers.us.householdEquivalentYears,-.019822839376000028,'reviewer reproduced cash loss at zero cash credit');
 return {passed:checks.length,checks};
}
if(process.argv.includes('--test'))console.log(JSON.stringify(test()));
if(process.argv.includes('--results'))console.log(JSON.stringify(diagnostics(),null,2));
