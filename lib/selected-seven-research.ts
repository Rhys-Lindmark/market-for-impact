import {calculate as ahc} from './alameda-health-consortium-model.mjs';
import {calculate as rainbow} from './rainbow-community-center-model.mjs';
import {calculate as edi} from './easy-does-it-model.mjs';
import {calculate as acknowledge} from './acknowledge-alliance-model.mjs';
import {calculate as mcbc} from './marin-county-bicycle-coalition-model.mjs';
import {calculate as svbc} from './silicon-valley-bicycle-coalition-model.mjs';
import {calculate as oaklandlgbtq} from './oakland-lgbtq-community-center-model.mjs';
function central(r:{rows?:Array<{id:string;bayCostPer10:number|null}>;results?:Array<{id:string;bayCostPer10:number|null}>}){return (r.rows??r.results)!.find(x=>x.id==='central')!.bayCostPer10;}
export const selectedSevenResearch=[
 {organization:"Alameda Health Consortium",program:"coverage access, behavioral-care coordination and workforce support",href:'/charities/alameda-health-consortium',scope:'Bay',bayUsdPerTenQalys:central(ahc()),sfUsdPerTenQalys:null},
 {organization:"Rainbow Community Center of Contra Costa County",program:"Finite psychotherapy access within a broad LGBTQ community organization",href:'/charities/rainbow-community-center',scope:'Bay',bayUsdPerTenQalys:central(rainbow()),sfUsdPerTenQalys:null},
 {organization:"Easy Does It Emergency Services",program:"Emergency attendant continuity and wheelchair repair within a broader disability-support organization",href:'/charities/easy-does-it',scope:'Bay',bayUsdPerTenQalys:central(edi()),sfUsdPerTenQalys:null},
 {organization:"Acknowledge Alliance",program:"Finite counseling health within school resilience and educator support",href:'/charities/acknowledge-alliance',scope:'Bay',bayUsdPerTenQalys:central(acknowledge()),sfUsdPerTenQalys:null},
 {organization:"Marin County Bicycle Coalition",program:"Finite road-injury prevention and youth physical activity within a broader cycling organization",href:'/charities/marin-county-bicycle-coalition',scope:'Bay',bayUsdPerTenQalys:central(mcbc()),sfUsdPerTenQalys:null},
 {organization:"Silicon Valley Bicycle Coalition",program:"Prospective safer-corridor design and timing within the whole cycling portfolio",href:'/charities/silicon-valley-bicycle-coalition',scope:'Bay',bayUsdPerTenQalys:central(svbc()),sfUsdPerTenQalys:null},
 {organization:"Oakland LGBTQ Community Center",program:"Finite HIV prevention, earlier ART care and short STI morbidity within a broad community center",href:'/charities/oakland-lgbtq-community-center',scope:'Bay',bayUsdPerTenQalys:central(oaklandlgbtq()),sfUsdPerTenQalys:null},
];
