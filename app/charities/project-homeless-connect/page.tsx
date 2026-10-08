import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/san-francisco/phc-v2-report.json';
export const metadata={title:'Project Homeless Connect | GiveBetter x SF'};
export default function Page(){return <LongFormResearchReport organization={report.organization} calibrationDate="2026-10-01" program={report.program} markdown={report.fullMarkdown} sources={report.sources} donationUrl={report.donationUrl} modelVersion={report.modelVersion} modelUrl="/api/phc-portfolio-model" minutes={20} modelLabel="GPT-6 Astra Light"/>;}
