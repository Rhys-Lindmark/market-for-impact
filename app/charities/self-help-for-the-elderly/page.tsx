import LongFormResearchReport from '@/components/LongFormResearchReport';
import {markdown,sources,modelVersion} from '@/lib/selfhelp-current-report.mjs';
export const metadata={title:'Self-Help for the Elderly — GiveBetter research',description:'A conditional therapeutic tai chi course with finite health and signed household-resource effects.'};
export default function Page(){return <LongFormResearchReport organization="Self-Help for the Elderly" program="Prospective therapeutic tai chi course" markdown={markdown} sources={sources} donationUrl="https://www.selfhelpelderly.org/donate" modelVersion={modelVersion} modelUrl="/api/sf-selfhelp-model" calibrationDate="2026-10-04" minutes={0} modelLabel="GPT-6.1 Sol" legacyMinutesAlreadyRecorded/>;}
