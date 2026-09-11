import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/san-francisco/nems-v2-report.json';
export const metadata={title:'North East Medical Services — V2 research | GiveBetter x SF'};
export default function Page(){return <LongFormResearchReport organization={report.organization} program={report.program} markdown={report.markdown} sources={report.sources} donationUrl={report.donationUrl} modelVersion={report.modelVersion} modelUrl="/api/nems-v2-model" minutes={18} modelLabel="GPT-6 Astra Light"/>;}
