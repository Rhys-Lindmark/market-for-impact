import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/sf/fuf-v2-report.json';
export const metadata={title:'Friends of the Urban Forest — V2 research | GiveBetter x SF'};
export default function Page(){return <LongFormResearchReport organization={report.organization} program={report.program} markdown={report.markdown} sources={report.sources} donationUrl={report.donationUrl} modelVersion="fuf-depth-v2-2025-sources" modelUrl="/api/fuf-model" minutes={19} modelLabel="GPT-6 Astra Light"/>;}
