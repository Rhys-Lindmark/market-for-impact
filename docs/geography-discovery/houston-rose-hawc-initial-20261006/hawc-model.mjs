import {calculate as core,scenarios as coreScenarios,defaults as shared} from './rose-model.mjs';
export const defaults={...shared,C:16163406,N:2700,clinicalN:2700,clinicalResponse:.2,unique:.6,b:.3,q:.08,T:.5,g:.98,success:.25,workGain:600,transferGain:400,cost:100,harm:.0005};
export const calculate=(o={})=>core({...defaults,...o});
export const scenarios=()=>coreScenarios(defaults);
export const cases=scenarios().map(s=>[s.id,s.overrides]);
