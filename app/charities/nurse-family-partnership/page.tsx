import LongFormResearchReport from '@/components/LongFormResearchReport';
import report from '@/data/us/nfp-report.json';
import {markdown,sources,modelVersion} from '@/lib/changent-current-report.mjs';
export const metadata={title:'Changent / Nurse-Family Partnership — GiveBetter research',description:'Home-visiting support: finite health, net household resources and donation impact.'};
export default function Page(){return <LongFormResearchReport organization={report.organization} program={report.program} markdown={markdown} sources={sources} donationUrl={report.donationUrl} modelVersion={modelVersion} modelUrl="/api/nfp-model" calibrationDate="2026-10-04" minutes={0} modelLabel="GPT-6.1 Sol" legacyMinutesAlreadyRecorded/>;}
