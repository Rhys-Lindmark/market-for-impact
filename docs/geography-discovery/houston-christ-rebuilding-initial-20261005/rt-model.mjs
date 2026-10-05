import {calculate as core,scenarios as coreScenarios,defaults as shared} from './cc-model.mjs';
export const defaults={...shared,C:4169236,N:150,unique:1,b:.4,completion:.25,q:.01,T:1,g:1,delay:.25,success:.5,medicalGain:1000,workGain:0,cost:100,baseline:20000};
export const calculate=(o={})=>core({...defaults,...o});
export const scenarios=()=>coreScenarios(defaults);
export const cases=scenarios().map(s=>[s.id,s.overrides]);
