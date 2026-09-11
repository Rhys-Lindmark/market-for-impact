import {calculate as core} from './breathe-v2-core.mjs';
export const VERSION='breathe-whole-budget-clinical-v2-2026-09-11';
export const OLD={"model_id":"breathe-ein941156307-expanded-clinical-coverage-v2","prepared":"2026-09-08","status":"Research correction only; full organization expectation unresolved; do not publish subset as whole-org estimate","foundation":{"gift_usd":100000,"discount":0.03,"cessation_allocation":0.15,"asthma_allocation":0.25,"cessation_cash_per_offer":250,"asthma_cash_per_offer":1200,"cessation_additionality":0.4,"asthma_additionality":0.35,"extra_six_month_quit":0.03,"background_quit_hazard":0.04,"relapse_hazard":0.1,"smoking_mortality":0.012,"quit_mortality":0.008,"smoking_utility":0.75,"quit_utility":0.77,"cessation_horizon":10,"mortality_recovery_lag":2,"cessation_delay":0.5,"asthma_extra_symptom_free_days":24.4,"asthma_transfer":0.5,"asthma_child_fraction":0.6,"asthma_utility_gap":0.1,"asthma_years":1,"asthma_delay":0.25,"cessation_external_per_offer":100,"asthma_external_per_offer":300,"cessation_bay_share":0.75,"cessation_sf_share":0.05,"asthma_bay_share":0.8,"asthma_sf_share":0.08,"cessation_harm_per_added_offer":0,"asthma_harm_per_added_offer":0,"independent_harm_q":0,"harm_bay_share":0.8,"harm_sf_share":0.05},"inputs":{"cpap_allocation":0.25,"cpap_cash_per_episode":500,"cpap_additionality":0.5,"cpap_qaly_one_year":0.005,"cpap_relative_transfer":0.8,"cpap_delay":0.25,"cpap_outside_per_episode":400,"cpap_bay_share":0.8,"cpap_sf_share":0.08,"adult_asthma_days_per_fortnight":2.02,"adult_asthma_transfer":0.5,"adult_asthma_symptom_utility_gap":0.1,"adult_asthma_homevisit_fraction":0.8},"scenarios":[{"id":"central","inputs":{}},{"id":"cpap_sf6d_measure","inputs":{"cpap_qaly_one_year":0.018}},{"id":"cpap_eq5d_lower_ci","inputs":{"cpap_qaly_one_year":-0.034}},{"id":"cpap_eq5d_upper_ci","inputs":{"cpap_qaly_one_year":0.044}},{"id":"cpap_financing_replacement","inputs":{"cpap_additionality":0}},{"id":"cpap_no_utility_effect","inputs":{"cpap_qaly_one_year":0}},{"id":"adult_asthma_null","inputs":{"adult_asthma_days_per_fortnight":0}},{"id":"all_replacement","foundation":{"cessation_additionality":0,"asthma_additionality":0},"inputs":{"cpap_additionality":0}},{"id":"no_sf","foundation":{"cessation_sf_share":0,"asthma_sf_share":0,"harm_sf_share":0},"inputs":{"cpap_sf_share":0}},{"id":"zero_gift","foundation":{"gift_usd":0},"inputs":{}},{"id":"new_path_harm","inputs":{"cpap_qaly_one_year":-0.02,"adult_asthma_days_per_fortnight":-1}},{"id":"cheap_cpap_high_response","inputs":{"cpap_cash_per_episode":250,"cpap_additionality":0.8,"cpap_qaly_one_year":0.018,"cpap_relative_transfer":1}},{"id":"copay_not_free_resource","inputs":{"cpap_outside_per_episode":800}},{"id":"no_discount","foundation":{"discount":0},"inputs":{}}]};
export const FINANCE={yearEnd:'2025-06-30',functional:1373246,eventDirect:6344,whole:1379590,environment:511139,lung:407539,tobacco:299166,community:25046,admin:130356};
export const BASE={foundation:{...OLD.foundation,cessation_allocation:FINANCE.tobacco*.4/FINANCE.whole,asthma_allocation:FINANCE.lung*.35/FINANCE.whole},inputs:{...OLD.inputs,cpap_allocation:FINANCE.lung*.45/FINANCE.whole}};
export const WORLDS=[
{id:'replacement',weight:.2,foundation:{cessation_additionality:0,asthma_additionality:0},inputs:{cpap_additionality:0}},
{id:'adverse',weight:.1,foundation:{extra_six_month_quit:-.005},inputs:{cpap_qaly_one_year:-.02,adult_asthma_days_per_fortnight:-1}},
{id:'cautious',weight:.3,foundation:{cessation_additionality:.2,asthma_additionality:.175,extra_six_month_quit:.015},inputs:{cpap_additionality:.25,cpap_qaly_one_year:0}},
{id:'central',weight:.3,foundation:{},inputs:{}},
{id:'favorable',weight:.1,foundation:{},inputs:{cpap_cash_per_episode:250,cpap_additionality:.8,cpap_qaly_one_year:.018,cpap_relative_transfer:1}}
];
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const finite=(n,k)=>{if(typeof n!=='number'||!Number.isFinite(n))throw new TypeError(k);return n;};
const scan=o=>{for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite derived output');if(obj(v)||Array.isArray(v))scan(v);}};
const price=(c,q)=>{if(q<=0||c===0)return null;const v=10*c/q;if(!Number.isFinite(v)||v===0)throw new RangeError('price overflow/underflow');return v;};
function checkedCore(base,world,gift){
 if(!obj(world)||(world.foundation!==undefined&&!obj(world.foundation))||(world.inputs!==undefined&&!obj(world.inputs)))throw new TypeError('world containers');
 for(const [kind,defaults] of [['foundation',OLD.foundation],['inputs',OLD.inputs]])for(const key of Object.keys(world[kind]??{})){if(!Object.hasOwn(defaults,key))throw new TypeError('unknown coefficient '+key);}
 const out=core(base,{foundation:{...world.foundation,gift_usd:gift},inputs:{...world.inputs}});
 // Replace the legacy fixed10% cost labels only; clinical and resource calculations unchanged.
 const oldMix=base.foundation===OLD.foundation;
 out.central_enabling_cost_usd=gift*(oldMix?.1:(FINANCE.admin+FINANCE.eventDirect)/FINANCE.whole);
 const actualFoundation={...base.foundation,...world.foundation},actualInputs={...base.inputs,...world.inputs};
 out.other_allocation_usd=gift-out.central_enabling_cost_usd-gift*(actualFoundation.cessation_allocation+actualFoundation.asthma_allocation+actualInputs.cpap_allocation);
 scan(out);return out;
}
export function calculate(options={}){
 if(!obj(options))throw new TypeError('options object');
 for(const k of Object.keys(options))if(!['gift','worlds','oldAllocation','residualBayQaly'].includes(k))throw new TypeError('unknown option '+k);
 const gift=options.gift===undefined?100000:options.gift;finite(gift,'gift');if(gift<0||gift>100000||(gift>0&&gift<1e-6))throw new RangeError('gift zero or1e-6..100000');
 if(options.oldAllocation!==undefined&&typeof options.oldAllocation!=='boolean')throw new TypeError('oldAllocation boolean');
 const base=options.oldAllocation?{foundation:OLD.foundation,inputs:OLD.inputs}:BASE;
 const worlds=options.worlds===undefined?WORLDS:options.worlds;if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('nonempty worlds');
 const ids=new Set();let sum=0;
 for(const w of worlds){if(!obj(w)||typeof w.id!=='string'||!w.id.trim()||ids.has(w.id.trim()))throw new TypeError('world id');ids.add(w.id.trim());finite(w.weight,'weight');if(w.weight<0||w.weight>1)throw new RangeError('weight');sum+=w.weight;}
 if(Math.abs(sum-1)>1e-12)throw new RangeError('weights sum1');
 const rows=worlds.map(w=>({id:w.id,weight:w.weight,result:checkedCore(base,w,gift)}));
 const central=checkedCore(base,{foundation:{},inputs:{}},gift);
 const regions={};
 for(const geo of ['us','bay','sf']){const q=rows.reduce((s,w)=>s+w.weight*w.result[geo].qaly,0);finite(q,'signed sum');regions[geo]={qaly:q,pricePer10:price(gift,q)};}
 const favorable=rows.find(w=>w.id.trim()==='favorable');
 const favorableContribution=favorable?favorable.weight*favorable.result.bay.qaly:0;
 const favorableShare=regions.bay.qaly===0?null:favorableContribution/regions.bay.qaly;
 const withoutFav=rows.filter(w=>w!==favorable),den=withoutFav.reduce((s,w)=>s+w.weight,0);
 const qNoFav=den>0?withoutFav.reduce((s,w)=>s+w.weight*w.result.bay.qaly,0)/den:null;
 const quantifiedAllocation=base.foundation.cessation_allocation+base.foundation.asthma_allocation+base.inputs.cpap_allocation;
 const out={version:VERSION,gift,wholeAnnualExpense:FINANCE.whole,scope:'whole donor cost; partial clinical health; residual unresolved',quantifiedAllocation,unquantifiedOrEnablingAllocation:1-quantifiedAllocation,central,weighted:regions,worlds:rows,favorableShare,withoutFavorable:{qaly:qNoFav,pricePer10:qNoFav===null?null:price(gift,qNoFav)},wholeOrganizationExpectedQaly:null,annualizedSubsetBayQaly:gift>0?regions.bay.qaly*FINANCE.whole/gift:0};
 if(options.residualBayQaly!==undefined){finite(options.residualBayQaly,'residual');if(Math.abs(options.residualBayQaly)>10000)throw new RangeError('residual bound');const q=regions.bay.qaly+options.residualBayQaly;out.userResidualDiagnostic={residualBayQaly:options.residualBayQaly,totalBayQaly:q,pricePer10:price(gift,q),status:'user supplied, not evaluator estimate'};}
 scan(out);return out;
}
export function oldBaseline(){const o=core(OLD);scan(o);return o;}
