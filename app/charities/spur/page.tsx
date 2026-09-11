import LongFormResearchReport from '@/components/LongFormResearchReport';
import narrative from '@/data/san-francisco/spur-v2-narrative.json';
import ledger from '@/data/san-francisco/spur-v2-sources.json';
import {version} from '@/lib/spur-v2-model.mjs';
export const metadata={title:'SPUR — V2 research | GiveBetter x SF',description:'Housing, transportation, clean heat and wider institutional work: source-grounded whole-portfolio assessment.'};
const sources=[...new Set(ledger.map(s=>s.url))].map(url=>{
 const entries=ledger.filter(s=>s.url===url),s=entries[0];
 return {title:s.title,url,publisher:s.publisher,published:[...new Set(entries.flatMap(e=>'published' in e?[String(e.published)]:[]))].join('; ')||'Not recorded',retrieved:[...new Set(entries.map(e=>e.retrieved))].join('; '),limit:entries.map(e=>'access' in e?String(e.access):'').filter(Boolean).join(' ')};
});
export default function Page(){return <LongFormResearchReport organization="SPUR" program="Housing, transportation, environmental health and civic systems" markdown={narrative.markdown} sources={sources} donationUrl="https://www.spur.org/join-renew-give/donate" modelVersion={version} modelUrl="/api/spur-v2-model" minutes={22} modelLabel="GPT-6 Astra Light" sectionTitles={{'1-what-does-the-organization-actually-do':'1. What do they do?','2-what-does-the-spending-record-establish':'Spending breakdown','3-delivery-and-monitoring-what-is-known-and-what-remains-missing':'2. Monitoring and information sharing','4-causal-evidence-and-transfer':'Clinical evidence and policy transfer','5-whole-gift-economics-and-finite-model':'4. What do you get for your dollar?','6-additional-funding-and-realistic-alternatives':'5. Funding and previous grants','7-qualitative-assessment-and-strongest-disconfirmation':'3. Qualitative assessment'}}/>;}
