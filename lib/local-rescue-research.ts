import {calculate as micahModel} from './micahs-hugs-model.mjs';
import {calculate as needModel} from './berkeley-need-model.mjs';
import {calculate as hopeModel} from './hope-v2-model.mjs';
// Rank these reports by their explicitly identified central scenario, not a
// probability-weighted result dominated by a speculative favorable tail.
export const localRescueResearch=[
 {organization:"Micah’s Hugs",program:'Naloxone access and recovery support',href:'/charities/micahs-hugs',bayUsdPerTenQalys:micahModel().rows.find(r=>r.id==='central')!.bayCostPer10,sfUsdPerTenQalys:null},
 {organization:'Berkeley NEED',program:'Community harm reduction and outreach',href:'/charities/berkeley-need',bayUsdPerTenQalys:needModel().results.find(r=>r.id==='central')!.bayCostPer10,sfUsdPerTenQalys:null},
 {organization:'HOPE Pacifica',program:'Community naloxone access and support',href:'/charities/hope-pacifica',bayUsdPerTenQalys:hopeModel().centralScenario!.bayCostPer10,sfUsdPerTenQalys:null},
];
