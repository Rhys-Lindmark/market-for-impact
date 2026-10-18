import {calculate as core,scenarios as coreScenarios,defaults as shared} from './sj-model.mjs';
export const defaults={...shared,C:16681490,N:300,unique:1,b:.4,completion:.5,q:.05,T:.5,g:.95,delay:.25,success:.25,medicalGain:0,workGain:1000,cost:100,baseline:15000};
export const calculate=(o={})=>core({...defaults,...o});
export const scenarios=()=>coreScenarios(defaults);
export const cases=scenarios().map(s=>[s.id,s.overrides]);
