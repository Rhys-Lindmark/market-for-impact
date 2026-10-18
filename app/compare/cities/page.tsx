import type {Metadata} from 'next';
import CityImpactComparison,{type CityImpactRow} from '@/components/CityImpactComparison';
import {EditionMasthead} from '@/components/GeographyEdition';
import {publishedEditionReports} from '@/lib/published-geography-reports';
import {reportsForEdition,researchListPrice,editionReportPath} from '@/lib/geography-reports.mjs';
import {unifiedResearch} from '@/lib/unified-research-index';
import expenses from '@/data/research-expenses.json';
import {sfAnnualBudget,editionAnnualBudget} from '@/lib/annual-budget-supplements.mjs';
import {canonicalBase} from '@/lib/geography-editions.mjs';
import '../../givebetter.css';
import './city-comparison.css';

export const metadata:Metadata={title:'Compare the top four across cities — GiveBetter',description:'Compare 24 nonprofits using annual budgets and modeled DALYs per dollar, with reported and estimated figures labeled.',alternates:{canonical:canonicalBase+'/compare/cities'}};
const cities=[['san-francisco','San Francisco Bay Area'],['new-york-city','New York City'],['los-angeles','Los Angeles'],['chicago','Chicago'],['houston','Houston'],['denver','Denver']];
export default function CityComparisonPage(){
 const rows:CityImpactRow[]=[];
 for(const [city,cityLabel] of cities){
  if(city==='san-francisco'){
   const picks=unifiedResearch.filter(r=>r.localUsdPerTenQalys!==null&&r.localUsdPerTenQalys>0).slice(0,4);
   for(const r of picks){const slug=r.href.split('/').at(-1)!;const record=(expenses.organizations as Record<string,unknown>)[slug];const budget=sfAnnualBudget(slug,record);rows.push({key:city+'/'+slug,city,cityLabel,organization:budget?.program?`${r.organization} — tai chi`:r.organization,href:r.href,costPerDaly:r.localUsdPerTenQalys!/10,budget:budget?.amountUSD??null,budgetKind:budget?.kind??'unknown',budgetLabel:budget?.label??'Unavailable',budgetNote:budget?.note??'',period:budget?.period??''});}
  }else{
   const picks=reportsForEdition({reports:publishedEditionReports},city).filter(r=>researchListPrice(r)>0).slice(0,4);
   for(const r of picks){const budget=editionAnnualBudget(r);rows.push({key:city+'/'+r.slug,city,cityLabel,organization:r.organization,href:canonicalBase+editionReportPath(r),costPerDaly:researchListPrice(r)/10,budget:budget?.amountUSD??null,budgetKind:budget?.kind??'unknown',budgetLabel:budget?.label??'Unavailable',budgetNote:budget?.note??'',period:budget?.period??''});}
  }
 }
 return <div className="givebetter"><EditionMasthead/><main className="city-comparison-page"><h1>The top four across cities</h1><p>Each city’s four lowest positive modeled $/DALY estimates, on shared linear axes. Color identifies the city; rectangle width represents annual expenses or an explicitly labeled budget estimate.</p><p>Area is an illustrative annual DALY extrapolation. It applies a report’s modeled cost-effectiveness to the annual size figure, even where that model covers a specific program. Reported years, accounting boundaries and estimate quality differ; these are not measured whole-organization outcomes or verified funding offers.</p><CityImpactComparison rows={rows}/><p>HOPE’s $40K width is a planning estimate ($20K–$100K sensitivity range). PHC’s ~$1.46M width is a historical city-program budget proxy; its current whole-project budget remains unverified after the 2025 funding cut. Read the linked reports for sources and limitations.</p><p><a href={canonicalBase+'/all'}>All cities and regions</a></p></main></div>;
}
