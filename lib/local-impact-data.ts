import remedy from '@/data/us/remedy-alliance-cea-v1.json';
import {remedyAllianceModel} from './remedy-alliance-model.mjs';
import {localImpact} from './local-impact-model.mjs';
const central=remedy.scenarios.find(s=>s.id==='central')!;
if(central.independentGiftHarm!==0)throw new Error('Specify independent harm locations before changing local central');
const r=remedyAllianceModel(central,remedy.giftUsd);
export const remedyLocalScenarios=[
 {name:'Central local-share judgment',sf:.005,bay:.02},
 {name:'Lower local share',sf:.0005,bay:.002},
 {name:'Higher local share',sf:.02,bay:.08},
 {name:'No SF benefit',sf:0,bay:.02},
 {name:'No Bay benefit',sf:0,bay:0}
].map(s=>({...s,...localImpact({gift:remedy.giftUsd,sharedQ:r.netOverallQaly,sfShare:s.sf,bayShare:s.bay})}));
