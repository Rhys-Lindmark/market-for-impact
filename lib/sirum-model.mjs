// Pure whole-gift calculator. No I/O, mutation of inputs, network or hidden calibration.
export const keys = ['gift','delivery_allocation','cash_per_shipped_rx','months_per_rx','dispensed_fraction','funded_years','bp_month_share','statin_month_share','bp_drugs_per_person','statin_drugs_per_person','financing_additionality','treatment_contrast','bp_transfer','statin_transfer','hazard_scale','horizon','mortality','discount','delay','bp_utility_loss','statin_utility_loss','other_harm_per_filled_rx','independent_harm_q','displaced_alternative_q','us_share','bay_share','sf_share','external_pharmacy_fraction','external_dispense_cost','other_external_per_rx','drug_opportunity_per_rx','outside_incremental_fraction','public_resource_fraction','bp_event_cost','statin_event_cost'];
const fractions=['delivery_allocation','dispensed_fraction','bp_month_share','statin_month_share','financing_additionality','treatment_contrast','bp_transfer','statin_transfer','bp_utility_loss','statin_utility_loss','us_share','bay_share','sf_share','external_pharmacy_fraction','outside_incremental_fraction','public_resource_fraction'];
keys.push('residual_utility_gain','residual_drugs_per_person','statin_state_horizon');
export function annuity(r,t){return r===0?t:-Math.expm1(-r*t)/r;}
export function trajectory(h0,ht,T,H,m,d){
  if(h0===ht||T===0||H===0)return {healthyDifference:0,eventsDifference:0};
  const a=Math.min(T,H), b=H-a, k=m+d;
  const healthyTarget=annuity(k+ht,a)+Math.exp(-(k+ht)*a)*annuity(k+h0,b);
  const healthyControl=annuity(k+h0,H);
  const eventsTarget=ht*annuity(k+ht,a)+Math.exp(-(k+ht)*a)*h0*annuity(k+h0,b);
  const eventsControl=h0*annuity(k+h0,H);
  return {healthyDifference:healthyTarget-healthyControl,eventsDifference:eventsTarget-eventsControl};
}
export function calculate(p){
  for(const k of keys)if(!Object.hasOwn(p,k)||typeof p[k]!=='number'||!Number.isFinite(p[k]))throw new RangeError('Required finite input: '+k);
  for(const k of keys)if(p[k]<0&&k!=='residual_utility_gain')throw new RangeError('Nonnegative input: '+k);
  if(Math.abs(p.residual_utility_gain)>1||p.residual_drugs_per_person<1||p.residual_drugs_per_person>20||p.statin_state_horizon>10)throw new RangeError('Residual finite utility / medication domain');
  for(const k of fractions)if(p[k]>1)throw new RangeError('Fraction: '+k);
  if(p.bp_month_share+p.statin_month_share>1||p.sf_share>p.bay_share||p.bay_share>p.us_share)throw new RangeError('Disjoint shares / nested geography');
  if(p.cash_per_shipped_rx<.01||p.cash_per_shipped_rx>1000||p.months_per_rx<.01||p.months_per_rx>12||p.funded_years<1/12||p.funded_years>5||p.bp_drugs_per_person<1||p.statin_drugs_per_person<1||p.bp_drugs_per_person>20||p.statin_drugs_per_person>20)throw new RangeError('Funded package domain');
  if(p.gift>1e8||p.horizon>40||p.mortality>2||p.discount>1||p.delay>20||p.hazard_scale>10||p.other_harm_per_filled_rx>1||p.independent_harm_q>1e6||p.displaced_alternative_q>1e6||p.external_dispense_cost>1e5||p.other_external_per_rx>1e5||p.drug_opportunity_per_rx>1e5||p.bp_event_cost>1e7||p.statin_event_cost>1e7)throw new RangeError('Finite planning domain');
  const shipped=p.gift*p.delivery_allocation/p.cash_per_shipped_rx;
  const filled=shipped*p.dispensed_fraction, months=filled*p.months_per_rx;
  const discountDelay=Math.exp(-p.discount*p.delay);
  const branches={};let health=0,medical=0,people=0;
  for(const [name,risk,rr] of [['bp',.082,.64],['statin',.252,.76]]){
    const nominalPeople=months*p[name+'_month_share']/(12*p.funded_years*p[name+'_drugs_per_person']);
    const additionalPeople=nominalPeople*p.financing_additionality*p.treatment_contrast;
    const h0=-Math.log1p(-risk)/5*p.hazard_scale;
    const ht=h0*(1-(1-rr)*p[name+'_transfer']);
    const state=trajectory(h0,ht,p.funded_years,name==='statin'?Math.min(p.horizon,p.statin_state_horizon):p.horizon,p.mortality,p.discount);
    const q=additionalPeople*state.healthyDifference*p[name+'_utility_loss']*discountDelay;
    const medicalDelta=additionalPeople*state.eventsDifference*p[name+'_event_cost']*discountDelay;
    branches[name]={nominalPeople,additionalPeople,baselineHazard:h0,targetHazard:ht,q,medicalDelta};
    health+=q;medical+=medicalDelta;people+=additionalPeople;
  }
  const residualPeople=months*(1-p.bp_month_share-p.statin_month_share)/(12*p.funded_years*p.residual_drugs_per_person);
  const residualAdditional=residualPeople*p.financing_additionality*p.treatment_contrast;
  const residualQ=residualAdditional*p.residual_utility_gain*annuity(p.mortality+p.discount,Math.min(p.funded_years,p.horizon))*discountDelay;
  branches.residual={nominalPeople:residualPeople,additionalPeople:residualAdditional,q:residualQ};health+=residualQ;people+=residualAdditional;
  // Linked harm applies across all newly exposed classes, not only successful high-risk patients.
  const drugHarm=filled*p.financing_additionality*p.treatment_contrast*p.other_harm_per_filled_rx*discountDelay;
  const totalQ=health-drugHarm-p.independent_harm_q-p.displaced_alternative_q;
  const outside=filled*(p.external_pharmacy_fraction*p.external_dispense_cost+p.other_external_per_rx+p.drug_opportunity_per_rx);
  const publicOutside=outside*p.public_resource_fraction;
  const grossResources=p.gift+outside+Math.max(medical,0);
  const netResources=p.gift+outside*p.outside_incremental_fraction+medical;
  const regions={};
  for(const [name,s]of [['total',1],['us',p.us_share],['bay',p.bay_share],['sf',p.sf_share]]){
    const q=s===0?0:totalQ*s;
    regions[name]={q,donorPer10Q:q>0?p.gift*10/q:null,grossResourcePer10Q:q>0?grossResources*10/q:null,netResourcePer10Q:q>0?netResources*10/q:null};
  }
  const out={shippedRx:shipped,filledRx:filled,medicationMonths:months,branches,additionalPeople:people,clinicalQ:health,drugHarm,independentHarmQ:p.independent_harm_q,displacedAlternativeQ:p.displaced_alternative_q,totalQ,nominalOutside:outside,nominalPublicOutside:publicOutside,nominalPrivateOutside:outside-publicOutside,incrementalOutside:outside*p.outside_incremental_fraction,medicalDelta:medical,grossResources,netResources,regions};
  const walk=x=>{for(const [k,v] of Object.entries(x)){if(v&&typeof v==='object')walk(v);else if(typeof v==='number'){if(!Number.isFinite(v))throw new RangeError('Output overflow');if(Object.is(v,-0))x[k]=0;}}};walk(out);return out;
}

