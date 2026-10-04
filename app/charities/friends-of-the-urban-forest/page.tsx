import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/sf/fuf-v2-report.json';
import {markdown,sectionOrder,sectionTitles} from '@/lib/fuf-calibrated-report.mjs';
import {modelVersion} from '@/lib/fuf-calibrated-model.mjs';
import receipts from '@/docs/geography-discovery/fuf-calibration-receipts-2026-10-01.json';
export const metadata={title:'Friends of the Urban Forest — research | GiveBetter x SF'};
const extraSources=receipts.sources.filter(s=>!report.sources.some(old=>old.url===s.url)).map(s=>({title:s.id.replaceAll('-',' '),url:s.url,publisher:s.id==='Portland-primary'?'Donovan and colleagues':s.id==='CG-crosswalk'?'Coefficient Giving':s.id.startsWith('city')||s.id==='public-funded-pipeline'?'San Francisco Public Works':'Friends of the Urban Forest',published:'Fiscal or publication period stated in this report',retrieved:'2026-10-01'}));
export default function Page(){return <LongFormResearchReport organization={report.organization} program={report.program} markdown={markdown} sources={[...report.sources,...extraSources]} donationUrl="https://give.friendsoftheurbanforest.org/give/376943" modelVersion={modelVersion} modelUrl="/api/fuf-model" calibrationDate="2026-10-01" sectionOrder={sectionOrder} sectionTitles={sectionTitles} minutes={19} modelLabel="GPT-6 Astra Light"/>;}
