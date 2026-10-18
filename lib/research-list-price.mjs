import {formatImpactPrice} from './impact-metric.mjs';
import {calculate as calculateNewDoor,cases as newDoorCases} from './newdoor-current-model.mjs';
import {calculate as calculateNems} from './nems-current-model.mjs';

const newDoorReference=calculateNewDoor(newDoorCases.find(s=>s.id==='finiteCourseWorkingPrior'));
const nemsReference=calculateNems();

// Presentation-only references. These do not replace the unidentified complete
// donation prices in the ranking or promote either organization to the shortlist.
export function researchListPrice(value,organization){
  if(value!==null)return {label:formatImpactPrice(value),note:'',detail:''};
  if(organization==='New Door Ventures'){
    const years=newDoorReference.bayIncludingSfCombinedHealthyYearEquivalent;
    return {
      label:formatImpactPrice(years<0?10*newDoorReference.budgetUsd/years:null),
      note:'Modeled harm',
      detail:'Signed cost divided by net modeled years in the conditional Bay Area reference. A negative value means modeled harm, not cheap benefit or observed causal harm. Complete ordinary-donation expected value remains unknown.',
    };
  }
  if(organization==='North East Medical Services')return {
    label:formatImpactPrice(nemsReference.bay.partialHealthUsdPerTen),note:'',
    detail:'Conditional HBV health-only reference. Income and the ordinary-donation total remain unknown; this is not a complete donation estimate.',
  };
  return {label:'Not estimated',note:'',detail:''};
}
