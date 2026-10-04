import LongFormResearchReport from '@/components/LongFormResearchReport';
import {markdown,sources,modelVersion} from '@/lib/newdoor-current-report.mjs';
export const metadata={title:'New Door Ventures — GiveBetter research',description:'Paid youth employment, education and career support; finite conditional health and net household resource assessment.'};
export default function Page(){return <LongFormResearchReport organization="New Door Ventures" program="Paid youth employment, education and career support" markdown={markdown} sources={sources} donationUrl="https://www.newdoor.org/donate/" modelVersion={modelVersion} modelUrl="/api/newdoor-portfolio-model" calibrationDate="2026-10-04" minutes={0} modelLabel="GPT-6.1 Sol" legacyMinutesAlreadyRecorded/>;}
