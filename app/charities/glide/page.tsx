import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/san-francisco/glide-v2-report.json';
import freshSources from '@/data/san-francisco/glide-calibrated-sources.json';
const sources=[...report.sources.filter(s=>!freshSources.some(f=>f.url===s.url)).map(s=>({...s,limit:'Inherited source scope; not newly reread unless the report explicitly says otherwise.'})),...freshSources];
import {markdown,version as VERSION} from '@/lib/glide-calibrated-report.mjs';

export const metadata={title:'GLIDE Foundation | GiveBetter x SF',description:'Full Foundation gift, finite clinical and housing health, three-year finances and current funding.'};
export default function Page(){return <LongFormResearchReport organization="GLIDE Foundation" program="Food, health access, family support, housing assistance and advocacy" markdown={markdown} sources={sources} donationUrl="https://www.glide.org/give/" modelVersion={VERSION} modelUrl="/api/glide-v2-model" calibrationDate="2026-10-04" minutes={36} modelLabel="GPT-6 Astra Light" sectionTitles={{"what-glide-does":"1. What do they do?","monitoring-and-information-sharing":"2. Monitoring and information sharing","qualitative-assessment":"3. Qualitative assessment","what-do-you-get-for-your-dollar":"4. What do you get for your dollar?","funding-and-previous-grants":"5. Funding and previous grants"}}/>;}
