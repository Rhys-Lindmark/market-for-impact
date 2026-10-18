import {calculate as core,scenarios as coreScenarios,defaults as shared} from './vh-model.mjs';
export const defaults={...shared,C:32035425,N:51493,unique:.15,g:.95};
export const calculate=(o={})=>core({...defaults,...o});
export const scenarios=()=>coreScenarios(defaults);
export const cases=scenarios().map(s=>[s.id,s.overrides]);
