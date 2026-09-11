import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/bay/pacific-hearing-v2-report.json';
import {modelVersion} from '@/lib/pacific-hearing-v2-model.mjs';
export const metadata={title:'Pacific Hearing Connection — V2 research | GiveBetter x SF'};
export default function Page(){return <LongFormResearchReport organization={report.organization} program={report.program} markdown={report.markdown} sources={report.sources} donationUrl={report.donationUrl} modelVersion={modelVersion} modelUrl="/api/pacific-hearing-connection-model" minutes={18} modelLabel="GPT-6 Astra Light"/>;}
