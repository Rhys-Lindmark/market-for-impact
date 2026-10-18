import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/bay/heppac-report.json';
import {markdown,sources,modelVersion} from '@/lib/heppac-current-report.mjs';
export const metadata={title:'HEPPAC — GiveBetter research',description:'East Bay harm reduction: health, net household resources and donation impact.'};
export default function Page(){return <LongFormResearchReport organization={report.organization} program="Overdose prevention, supplies and connections to care" markdown={markdown} sources={sources} donationUrl={report.donationUrl} modelVersion={modelVersion} modelUrl="/api/heppac-model" calibrationDate="2026-10-04" minutes={0} modelLabel="GPT-6.1 Sol" legacyMinutesAlreadyRecorded/>;}
