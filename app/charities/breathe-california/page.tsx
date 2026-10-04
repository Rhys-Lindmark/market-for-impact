import LongFormResearchReport from '@/components/LongFormResearchReport';
import sources from '@/data/san-francisco/breathe-v2-sources.json';
import freshSources from '@/data/san-francisco/breathe-calibrated-sources.json';
import report from '@/data/san-francisco/breathe-coverage-report.json';
import {markdown,version} from '@/lib/breathe-calibrated-report.mjs';
const combinedSources=[...sources.sources.filter(s=>!freshSources.some(f=>f.url===s.url)).map(s=>({...s,limit:'Inherited source; not newly reread unless the report states otherwise.'})),...freshSources];
export const metadata={title:'Breathe California | GiveBetter x SF',description:'Respiratory care, equipment access and clean-air work, with health and household-resource estimates.'};
export default function Page(){return <LongFormResearchReport organization="Breathe California" program="Lung health, access to care and environmental programs" markdown={markdown} sources={combinedSources} donationUrl={report.donationUrl} modelVersion={version} modelUrl="/api/breathe-v2-model" calibrationDate="2026-10-04" minutes={16} modelLabel="GPT-6 Astra Light"/>;}
