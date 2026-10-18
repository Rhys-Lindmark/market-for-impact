// Isolated candidate. Configure BREATHE_REPO after integration; legacy files remain untouched.
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const repo=process.env.BREATHE_REPO||'/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta';
const moduleAt=p=>import(pathToFileURL(`${repo}/lib/${p}`).href);
const [{BASE,FINANCE,calculate:legacy},{calculate:clinical},{incomeHealthyYearEquivalent:bridge}]=await Promise.all(['breathe-v2-model.mjs','breathe-v2-core.mjs','income-health-equivalence.mjs'].map(moduleAt));
export const version='breathe-signed-household-candidate-2026-10-04';
export const reference={baselineIncomeUSD:50000,nonoverlapShare:1,householdKnown:false,tobaccoNetAnnualUSD:0,cpapPurchaseReplacementShare:0,cpapReplacementNetUSD:0,cessation:{earnings:0,care:0,fee:0,travel:0,treatment:0},asthma:{earnings:0,care:0,fee:0,travel:0,treatment:0},cpap:{earnings:0,care:0,fee:0,travel:0,treatment:0}};
const probability=v=>Number.isFinite(v)&&v>=0&&v<=1;
const price=(c,q)=>c>0&&q>0?10*c/q:null;
export function calculate({gift=100000,foundation={},inputs={},household={},resourceMultiplier=1,independentHarmUS=0,harmBayShare=.8,harmSFShare=.05}={}){
 if(!Number.isFinite(gift)||gift<0||gift>100000||!Number.isFinite(resourceMultiplier)||resourceMultiplier<1||resourceMultiplier>1000||!Number.isFinite(independentHarmUS)||independentHarmUS<0||independentHarmUS>1e8||![harmBayShare,harmSFShare].every(probability)||harmSFShare>harmBayShare)throw Error('cost/harm/geography');
 for(const key of Object.keys(foundation))if(!Object.hasOwn(BASE.foundation,key)||key==='gift_usd')throw Error('foundation key');
 for(const key of Object.keys(inputs))if(!Object.hasOwn(BASE.inputs,key))throw Error('input key');
 for(const key of Object.keys(household))if(!Object.hasOwn(reference,key))throw Error('household key');
 const p={...BASE.foundation,...foundation,gift_usd:gift},x={...BASE.inputs,...inputs};
 const j={...reference,...household};
 if(!Number.isFinite(j.baselineIncomeUSD)||j.baselineIncomeUSD<=0||!Number.isFinite(j.tobaccoNetAnnualUSD)||j.tobaccoNetAnnualUSD<=-j.baselineIncomeUSD||!probability(j.nonoverlapShare)||typeof j.householdKnown!=='boolean')throw Error('household domain');
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
  const q=people===0?0:bridge({people,annualIncomeBeforeUSD:j.baselineIncomeUSD,annualIncomeGainUSD:net,years:1,independentShare:j.nonoverlapShare,delayYears:delay,discountRate:p.discount});
  rows.push({id,people,cash,netHouseholdUSD:people*net,oneYearCashEquivalent:q,bayShare:bay,sfShare:sf});
 }
 if(!probability(j.cpapPurchaseReplacementShare)||j.cpapPurchaseReplacementShare+x.cpap_additionality>1+1e-12||!Number.isFinite(j.cpapReplacementNetUSD)||j.cpapReplacementNetUSD<=-j.baselineIncomeUSD)throw Error('replacement incidence or net');
 const replacementPeople=raw.cpap_nominal_episodes*j.cpapPurchaseReplacementShare;
 const replacementQ=replacementPeople===0?0:bridge({people:replacementPeople,annualIncomeBeforeUSD:j.baselineIncomeUSD,annualIncomeGainUSD:j.cpapReplacementNetUSD,years:1,independentShare:j.nonoverlapShare,delayYears:x.cpap_delay,discountRate:p.discount});
 rows.push({id:'cpap-financing-replacement',people:replacementPeople,cash:{netAfterFeesTravelCare:j.cpapReplacementNetUSD},netHouseholdUSD:replacementPeople*j.cpapReplacementNetUSD,oneYearCashEquivalent:replacementQ,bayShare:x.cpap_bay_share,sfShare:x.cpap_sf_share});
 // Tobacco spending counts only initial extra quits while abstinence differs among
 // common survivors. Both arms quit/relapse; no wages or consumption of extra survivors.
 // Annual net excludes replacement products and foregone tobacco enjoyment by judgment.
 let tobacco=0,abstinentPersonYears=0;
 for(let year=0;year<Math.ceil(p.cessation_horizon);year++){
  const span=Math.min(1,p.cessation_horizon-year),haz=p.background_quit_hazard+p.relapse_hazard+p.smoking_mortality;
  const exposure=haz===0?span:Math.exp(-haz*year)*(-Math.expm1(-haz*span))/haz;
  const people=cPeople*Math.abs(p.extra_six_month_quit)*exposure;
  abstinentPersonYears+=Math.sign(p.extra_six_month_quit)*people;
  if(people>0)tobacco+=Math.sign(p.extra_six_month_quit)*bridge({people,annualIncomeBeforeUSD:j.baselineIncomeUSD,annualIncomeGainUSD:j.tobaccoNetAnnualUSD,years:1,independentShare:j.nonoverlapShare,delayYears:p.cessation_delay+year,discountRate:p.discount});
 }
 const ledgers={};
 for(const geo of ['us','bay','sf']){
  const share=geo==='us'?1:p['cessation_'+geo+'_share'];
  const income=rows.reduce((s,r)=>s+r.oneYearCashEquivalent*(geo==='us'?1:r[geo+'Share']),0)+tobacco*share;
  const rawHarm=cPeople*p.cessation_harm_per_added_offer*(geo==='us'?1:p['cessation_'+geo+'_share'])+aPeople*p.asthma_harm_per_added_offer*(geo==='us'?1:p['asthma_'+geo+'_share'])+p.independent_harm_q*(geo==='us'?1:p['harm_'+geo+'_share']);
  const health=(raw[geo].qaly+rawHarm)*j.nonoverlapShare-rawHarm-independentHarmUS*(geo==='us'?1:geo==='bay'?harmBayShare:harmSFShare);
  const subtotal=health+income;
  ledgers[geo]={healthQaly:health,householdEquivalentYears:income,quantifiedSubtotal:subtotal,conditionalDonorPer10:price(gift,subtotal),conditionalPartialResourcePer10:price(raw.gross_partial_resource_usd*resourceMultiplier,subtotal),wholeOrganizationEquivalentYears:null,wholeOrganizationPrice:null};
 }
 const native={additionalInitialQuits:cPeople*p.extra_six_month_quit,childSymptomFreeDays:aPeople*p.asthma_child_fraction*p.asthma_extra_symptom_free_days*p.asthma_transfer,adultSymptomFreeDays:aPeople*(1-p.asthma_child_fraction)*x.adult_asthma_homevisit_fraction*x.adult_asthma_days_per_fortnight/14*365*x.adult_asthma_transfer,additionalCPAPEpisodes:cEpisodes};
 return {version,gift,annualExpenseBoundary:FINANCE.whole,rankingStatistic:'conditional central quantified subtotal; not empirical EV',householdStatus:j.householdKnown?'user-supplied known conditional cash':'unknown; zero reference is not evidence of zero',unquantifiedShare:1-p.cessation_allocation-p.asthma_allocation-x.cpap_allocation,ledgers,native,nativeWholeGiftUSDPerOutcome:Object.fromEntries(Object.entries(native).map(([k,v])=>[k,v>0?gift/v:null])),householdRows:rows,tobacco:{abstinentPersonYears,equivalentYears:tobacco,netAnnualUSD:j.tobaccoNetAnnualUSD},partialResourcesUSD:raw.gross_partial_resource_usd*resourceMultiplier,clinicalRaw:perQuit};
}
export function diagnostics(){
 const zeroHealth={extra_six_month_quit:0,asthma_extra_symptom_free_days:0};
 const noClinical={cpap_qaly_one_year:0,adult_asthma_days_per_fortnight:0};
 return {central:calculate(),zeroGift:calculate({gift:0}),completeNull:calculate({foundation:zeroHealth,inputs:noClinical}),replacement:calculate({foundation:{cessation_additionality:0,asthma_additionality:0},inputs:{cpap_additionality:0}}),harm:calculate({foundation:{extra_six_month_quit:-.005},inputs:{cpap_qaly_one_year:-.02,adult_asthma_days_per_fortnight:-1},household:{cpap:{fee:100,travel:50}}}),costStress:calculate({resourceMultiplier:2}),deliveryCostStress:calculate({foundation:{cessation_cash_per_offer:500,asthma_cash_per_offer:2400},inputs:{cpap_cash_per_episode:1000}}),noDiscount:calculate({foundation:{discount:0}}),zeroOverlap:calculate({household:{nonoverlapShare:0}}),zeroOverlapIndependentHarm:calculate({household:{nonoverlapShare:0},independentHarmUS:.01}),noSF:calculate({foundation:{cessation_sf_share:0,asthma_sf_share:0},inputs:{cpap_sf_share:0}}),tobaccoSaving:calculate({household:{tobaccoNetAnnualUSD:1500}}),tobaccoLoss:calculate({household:{tobaccoNetAnnualUSD:-500}}),cpapPurchaseSaving:calculate({household:{cpapPurchaseReplacementShare:.25,cpapReplacementNetUSD:350}}),cpapBurden:calculate({household:{cpap:{fee:100,travel:50,treatment:100}}}),adultLostWork:calculate({household:{asthma:{earnings:-100,care:50}}}),nullHealthPositiveCash:calculate({foundation:zeroHealth,inputs:noClinical,household:{cpapPurchaseReplacementShare:.25,cpapReplacementNetUSD:350}}),lowerCPAP:calculate({inputs:{cpap_qaly_one_year:-.034}}),upperCPAP:calculate({inputs:{cpap_qaly_one_year:.044}})};
}
export function test(){const d=diagnostics();assert.equal(d.zeroGift.ledgers.us.quantifiedSubtotal,0);assert.equal(d.completeNull.ledgers.us.quantifiedSubtotal,0);assert.equal(d.replacement.ledgers.us.quantifiedSubtotal,0);assert.equal(d.zeroOverlap.ledgers.us.quantifiedSubtotal,0);assert.equal(d.zeroOverlapIndependentHarm.ledgers.us.quantifiedSubtotal,-.01);assert.equal(d.noSF.ledgers.sf.quantifiedSubtotal,0);assert(d.harm.ledgers.us.quantifiedSubtotal<0);assert.equal(d.harm.ledgers.us.conditionalDonorPer10,null);assert(d.nullHealthPositiveCash.ledgers.us.householdEquivalentYears>0);assert(d.cpapBurden.ledgers.us.householdEquivalentYears<0);assert(d.tobaccoLoss.ledgers.us.householdEquivalentYears<0);assert(d.deliveryCostStress.ledgers.us.quantifiedSubtotal<d.central.ledgers.us.quantifiedSubtotal);assert.equal(d.costStress.ledgers.us.quantifiedSubtotal,d.central.ledgers.us.quantifiedSubtotal);assert.equal(d.central.ledgers.us.wholeOrganizationPrice,null);assert.throws(()=>calculate({inputs:{cpap_sf_share:.9}}));assert.throws(()=>calculate({household:{cpap:{fee:50000}}}));assert.throws(()=>calculate({household:{tobaccoNetAnnualUSD:NaN}}));return {passed:17};}
if(process.argv.includes('--test'))console.log(JSON.stringify(test()));
if(process.argv.includes('--results'))console.log(JSON.stringify(diagnostics(),null,2));
