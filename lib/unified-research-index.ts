import {sortedResearchPrograms} from './sf-research-index';
import {usResearch} from './us-research-index';
import {remedyLocalScenarios} from './local-impact-data';
import {bayResearch} from './bay-research-index';
import {californiaResearch} from './california-research-index';
const localPrice=(sf:number|null|undefined,bay:number|null|undefined)=>sf??bay??null;
const localGeography=(sf:number|null|undefined)=>sf!==null&&sf!==undefined?'San Francisco':'Bay Area';
// Every displayed comparison price is local: SF when modeled, otherwise Bay Area.
// Never substitute a global or national price. International comparators live in the archive.
export const unifiedResearch=[
 ...californiaResearch.map(r=>({organization:r.organization+' (California)',program:r.program,href:r.href,scope:'California',localUsdPerTenQalys:r.sfUsdPerTenQalys as number|null,estimateGeography:'San Francisco',localStatus:'Modeled SF share of statewide health; see report'})),
 ...sortedResearchPrograms.map(r=>({organization:r.organization,program:r.program,href:r.href,scope:'SF',localUsdPerTenQalys:r.centralUsdPerTenQalys as number|null,estimateGeography:'San Francisco',localStatus:'modeled'})),
 ...bayResearch.map(r=>({organization:r.organization+(r.scope==='SF'?'':' (Bay Area)'),program:r.program,href:r.href,scope:r.scope??'Bay',localUsdPerTenQalys:localPrice(r.sfUsdPerTenQalys,r.bayUsdPerTenQalys),estimateGeography:localGeography(r.sfUsdPerTenQalys),localStatus:r.href==='/charities/bayview-hunters-point-foundation'?'Subjective modeled SF-resident allocation: 65%; measured residence unavailable':r.sfUsdPerTenQalys===null?'Modeled Bay Area estimate; SF share not established':'Modeled SF share; see report'})),
 ...usResearch.map(r=>{
  const sf=r.href==='/charities/remedy-alliance'?remedyLocalScenarios[0].sfUsdPer10Q:r.sfUsdPerTenQalys;
  const bay=r.href==='/charities/remedy-alliance'?remedyLocalScenarios[0].bayUsdPer10Q:r.bayUsdPerTenQalys;
  return {organization:r.organization+' (U.S.)',program:r.program,href:r.href,scope:'US',localUsdPerTenQalys:localPrice(sf,bay),estimateGeography:localGeography(sf),localStatus:'Very uncertain modeled local-share judgment; see report'};
 }),
].sort((a,b)=>(a.localUsdPerTenQalys??Infinity)-(b.localUsdPerTenQalys??Infinity)||a.organization.localeCompare(b.organization));
