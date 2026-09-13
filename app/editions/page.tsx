import type {Metadata} from 'next';
import progress from '@/docs/geography-progress.json';
import {EditionMasthead} from '@/components/GeographyEdition';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import '../givebetter.css';
import '../edition.css';
export const metadata:Metadata={title:'GiveBetter — Cities and regions',description:'Explore GiveBetter research by city and region.',alternates:{canonical:canonicalBase+'/editions'},openGraph:{title:'GiveBetter — Cities and regions',images:[]},twitter:{title:'GiveBetter — Cities and regions',images:[]}};
export default function EditionsPage(){
 return <div className="givebetter"><EditionMasthead/><main className="gb-edition"><h1>Cities and regions</h1>
 <p><a href={canonicalBase}>San Francisco Bay Area</a> — existing shortlist and research.</p>
 <p>Eleven new editions are in development. Each will compare 25 organizations, examine ten in greater depth, and select four giving leads.</p>
 <div className="gb-edition-table-wrap"><table className="gb-edition-table"><caption>Published research—not candidate leads</caption><thead><tr><th scope="col">Edition</th><th scope="col">Initial reports</th><th scope="col">In-depth reviews</th></tr></thead><tbody>{progress.editions.map(e=><tr key={e.id}><th scope="row"><a href={canonicalBase+editionPath(e.id)}>{e.label}</a></th><td>{e.alphaPublished}/25</td><td>{e.betaAcceptedPublished}/10</td></tr>)}</tbody></table></div>
 <footer><a href={canonicalBase}>GiveBetter x SF</a></footer></main></div>;
}
