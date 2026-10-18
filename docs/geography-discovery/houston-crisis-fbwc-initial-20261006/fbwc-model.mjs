import {calculate as core,scenarios as coreScenarios,defaults as shared} from './crisis-model.mjs';
export const defaults={...shared,C:15639175,N:199,clinicalN:199,clinicalResponse:.3,unique:.9,b:.35,q:.06,T:1,g:.98,delay:.25,success:.5,workGain:400,transferGain:800,cost:200,harm:.0005};
export const calculate=(o={})=>core({...defaults,...o});
export const scenarios=()=>coreScenarios(defaults).map(s=>s.id==='full-volunteer-cost-hypothesis'?{...s,id:'higher-resource-cost',label:'higher recognized resource cost',overrides:{C:25000000},...calculate({C:25000000})}:s);
export const cases=scenarios().map(s=>[s.id,s.overrides]);
