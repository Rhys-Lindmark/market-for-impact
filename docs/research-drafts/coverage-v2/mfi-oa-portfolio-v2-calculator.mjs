import {calculate as foundation,finiteYears,CATEGORIES} from './mfi-oa-portfolio-calculator.mjs';
export function calculate(m,scenario={}){
 const p={...m.foundation.central_inputs,...scenario.baseOverrides},b=foundation(p),paths=[];
 const sums=Object.fromEntries(CATEGORIES.map(k=>[k,0]));sums.gi=p.crc_selected_fraction;sums.general=p.hernia_selected_fraction;sums.eye=p.eye_selected_fraction;
 let q=b.overall_q,totalNewHarm=0,newPeople=0,covered=0,downstream=0;
 const fields={share:[0,1],utility_gain:[-1,1],treatment_success:[0,1],harm_q_per_person:[0,1],services_per_person:[1,20],disjoint_fraction:[0,1],catchup_hazard:[0,10],loss_hazard:[0,5],mortality_hazard:[0,1],horizon_years:[0,30],delay_years:[0,5]};
 for(const source of m.paths){const a={...source,...scenario.allPaths,...scenario.pathOverrides?.[source.id]};if(!Object.hasOwn(sums,a.category))throw Error('Unknown category');for(const[k,[lo,hi]]of Object.entries(fields))if(typeof a[k]!=='number'||!Number.isFinite(a[k])||a[k]<lo||a[k]>hi)throw Error('Invalid '+k);if(!Number.isFinite(a.downstream_resource_per_nominal_service)||a.downstream_resource_per_nominal_service<0||a.downstream_resource_per_nominal_service>1e6)throw Error('Invalid downstream resources');sums[a.category]+=a.share;
 const nominal=p.gift_usd*p[a.category+'_allocation']/p[a.category+'_cash_per_service']*a.share;
 const people=nominal*b.activity_factor/a.services_per_person*a.disjoint_fraction;downstream+=nominal*a.downstream_resource_per_nominal_service;
 const grossPer=a.treatment_success*a.utility_gain*Math.pow(1+p.discount,-a.delay_years)*finiteYears(a.catchup_hazard+a.loss_hazard+a.mortality_hazard+Math.log1p(p.discount),a.horizon_years);
 const gross=people*grossPer,harm=people*a.harm_q_per_person,net=gross-harm;q+=net;totalNewHarm+=harm;newPeople+=people;covered+=nominal;paths.push({id:a.id,name:a.name,nominal_services:nominal,unique_people:people,gross_q:gross,harm_q:harm,net_q:net});
 }
 for(const k of CATEGORIES)if(Math.abs(sums[k]-1)>1e-9)throw Error('Incomplete / overlapping specialty case mix '+k);
 const grossResources=b.gross_resource_usd+downstream;const regions={};for(const [g,s]of [['us',1],['bay',p.bay_share],['sf',p.sf_share]]){const z=s===0?0:q*s;regions[g]={q:z,donor_per_10q:z>0?p.gift_usd*10/z:null,resource_per_10q:z>0?grossResources*10/z:null};}
 const out={foundation:b,new_paths:paths,new_unique_people:newPeople,new_path_harm:totalNewHarm,new_path_net_q:q-b.overall_q,total_q:q,whole_gift_usd:p.gift_usd,gross_resource_usd:grossResources,additional_downstream_resources:downstream,nominal_services:b.nominal_services,ledger_service_total:covered+b.crc_nominal_selected_services+b.eye_nominal_selected_services+b.hernia_nominal_selected_services,regions};
 const walk=x=>{for(const v of Object.values(x)){if(v&&typeof v==='object')walk(v);else if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite output');}};walk(out);return out;
}

