import type {Metadata} from 'next';
import {EditionMasthead} from '@/components/GeographyEdition';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import reports from '@/data/geography-reports.json';
import researchEffort from '@/data/research-effort.json';
import {homepageResearchTime,homepageRegions} from '@/lib/homepage-research.mjs';
import '../givebetter.css';
import '../edition.css';
import './home.css';
export const metadata:Metadata={title:'GiveBetter — Cities and regions',description:'Explore GiveBetter research by city and region.',alternates:{canonical:canonicalBase+'/all'},openGraph:{title:'GiveBetter — Cities and regions',images:[]},twitter:{title:'GiveBetter — Cities and regions',images:[]}};
export default function EditionsPage(){
 const researchTime=homepageResearchTime(researchEffort,reports);
 return <div className="givebetter gb-home"><EditionMasthead/><main>
 <section className="gb-home-hero" aria-labelledby="giving-mission">
  <img src={canonicalBase+'/images/regions/hero.webp'} alt="" width="1800" height="693" fetchPriority="high"/>
  <div className="gb-home-hero-copy">
   <h1 id="giving-mission">We research programs that improve lives <em>the most per dollar</em>, for a given region.</h1>
   <p className="gb-home-hero-research"><a href={canonicalBase+'/research-time'}>{researchTime.hours===null?'Research grounded in evidence':`Backed by ${Math.floor(researchTime.hours).toLocaleString('en-US')}+ hours of AI research`}</a></p>
  </div>
 </section>
 <section className="gb-home-regions" aria-labelledby="choose-region">
  <h2 id="choose-region">Choose a city or region</h2>
  <ul className="gb-home-region-grid">{homepageRegions.map(region=><li key={region.id}><a href={canonicalBase+'/'+region.id}>
   <img src={canonicalBase+(region.image?'/images/regions/'+region.image+'.webp':'/images/givebetter-city.webp')} alt="" width="400" height="400" loading="lazy"/>
   <span>{region.label}</span>
  </a></li>)}</ul>
 </section>
 <div className="gb-home-progress gb-edition">
 <div className="gb-agent-box"><span>Point your agent here</span><a className="gb-agent-url" href={canonicalBase+'/llms.txt'}>{canonicalBase}/llms.txt</a><p>Estimates as JSON and MCP, plus an open repository agents can contribute to. <a href={canonicalBase+'/agents'}>Agent docs</a></p></div>
 <nav aria-label="Explore the research"><a href={canonicalBase+'/compare/cities'}>Compare cities</a><a href={canonicalBase+'/research/city-theory'}>What we learned across all reports</a><a id="research-time" href={canonicalBase+'/research-time'}>Research time and progress</a></nav>
 </div></main></div>;
}
