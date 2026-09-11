export function scenarios(model){
  const make=(id,change)=>{const inputs=structuredClone(model);change(inputs);return{id,inputs};};
  return [make('central',()=>{}),
    make('no_additional_funding',m=>m.shared.funding_additionality=0),
    make('zero_absorbable_capacity',m=>m.shared.capacity_gift=0),
    make('harm_only',m=>{m.shared.funding_additionality=0;m.shared.independent_harm_q=.1;}),
    make('no_favorable_clinical_effect',m=>{m.survival.rescue_hazard_reduction=0;m.survival.moud_causal_transfer=0;m.housing.incremental_stability=0;m.groups.forEach(g=>g.response=0);}),
    make('weak_delivery',m=>{m.shared.funding_additionality=.1;m.survival.rescue_hazard_reduction=.001;m.survival.moud_causal_transfer=.1;m.groups.forEach(g=>g.response*=.25);m.housing.incremental_stability=.01;}),
    make('favorable_delivery',m=>{m.shared.funding_additionality=.7;m.survival.rescue_hazard_reduction=.01;m.survival.moud_causal_transfer=.8;m.survival.moud_effective_retention=.8;m.groups.forEach(g=>g.response=Math.min(1,g.response*2));m.housing.incremental_stability=.112;}),
    make('no_moud_effect',m=>m.survival.moud_causal_transfer=0),
    make('no_rescue_effect',m=>m.survival.rescue_hazard_reduction=0),
    make('no_survival_overlap',m=>m.survival.rescue_moud_overlap=0),
    make('maximum_survival_overlap',m=>m.survival.rescue_moud_overlap=1),
    make('adverse_moud',m=>m.survival.moud_observed_hr=1.3),
    make('adverse_rescue',m=>m.survival.rescue_hazard_reduction=-.01),
    make('adverse_group_health',m=>m.groups.forEach(g=>g.utility=-Math.abs(g.utility))),
    make('no_distinct_symptom_health',m=>{m.groups.forEach(g=>g.unique_health=0);m.housing.unique_health=0;}),
    make('fully_funded_three_year_moud',m=>m.survival.moud_active_years=3),
    make('longer_funded_symptom_courses',m=>m.groups.forEach(g=>g.years*=2)),
    make('zero_discount',m=>m.shared.discount=0),
    make('no_direct_sf',m=>m.shared.sf=0),
    make('large_gift_capacity_held',m=>m.shared.gift=1000000)
  ];
}
