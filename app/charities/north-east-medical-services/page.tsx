import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/san-francisco/nems-v2-report.json';
import {markdown,sources,modelVersion} from '@/lib/nems-current-report.mjs';
export const metadata={title:'North East Medical Services — V2 research | GiveBetter x SF'};
export default function Page(){return <LongFormResearchReport organization={report.organization} program="Clinical care and conditional hepatitis B navigation" markdown={markdown} sources={sources} donationUrl={report.donationUrl} modelVersion={modelVersion} modelUrl="/api/nems-v2-model" calibrationDate="2026-10-04" minutes={18} modelLabel="GPT-6 Astra Light"/>;}
