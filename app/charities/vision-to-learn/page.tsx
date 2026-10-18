import LongFormResearchReport from '@/components/LongFormResearchReport';
import {markdown,sources,modelVersion} from '@/lib/vtl-legacy-current-report.mjs';
export const metadata={title:'Vision To Learn — GiveBetter research'};
export default function Page(){return <LongFormResearchReport organization="Vision To Learn" program="School-based vision care" markdown={markdown} sources={sources} donationUrl="https://visiontolearn.org/" modelVersion={modelVersion} modelUrl="/api/vision-to-learn-model" calibrationDate="2026-10-04" minutes={0} modelLabel="GPT-6.1 Sol" legacyMinutesAlreadyRecorded/>;}
