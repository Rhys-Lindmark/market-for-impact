import {calculate as core,scenarios as coreScenarios,defaults as shared} from './av-model.mjs';
export const defaults={...shared,C:15979301,N:285,unique:.8,b:.25,completion:.2,q:.03,success:.5,transferGain:600,cost:75};
export const calculate=(o={})=>core({...defaults,...o});
export const scenarios=()=>coreScenarios(defaults);
export const cases=scenarios().map(s=>[s.id,s.overrides]);
