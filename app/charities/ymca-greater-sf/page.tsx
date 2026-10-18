import LongFormResearchReport from '@/components/LongFormResearchReport';
import {markdown,sources,modelVersion} from '@/lib/ymca-current-report.mjs';
export const metadata={title:'YMCA of Greater San Francisco — GiveBetter research'};
export default function Page(){return <LongFormResearchReport organization="YMCA of Greater San Francisco" program="Community health and family services" markdown={markdown} sources={sources} donationUrl="https://www.ymcasf.org/donate/" modelVersion={modelVersion} modelUrl="/api/ymca-portfolio-model" calibrationDate="2026-10-04" minutes={0} modelLabel="GPT-6.1 Sol" legacyMinutesAlreadyRecorded/>;}
