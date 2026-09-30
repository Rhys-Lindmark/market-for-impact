import {earningsResearchLanes} from '@/lib/better-paying-jobs.mjs';
import {canonicalBase} from '@/lib/geography-editions.mjs';

export default function EarningsResearch({id}:{id:string}){
 const lane=earningsResearchLanes.find(lane=>lane.id===id);
 if(!lane)return null;
 return <section className="gb-earnings-research" aria-labelledby={'earnings-'+id}>
  <h2 id={'earnings-'+id}>Better-paying jobs</h2>
  <p>{lane.focus}</p>
  <p><a href={canonicalBase+'/research/better-paying-jobs#'+id}>Read the earnings research and candidates for {lane.label}</a></p>
 </section>;
}
