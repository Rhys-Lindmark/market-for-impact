import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/us/nfp-report.json';
export const metadata={title:'Changent / Nurse-Family Partnership — GiveBetter research',description:'Whole-organization national-gift analysis with finite QALY assumptions, historical gross costs, and explicit unmeasured local allocation.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/nfp-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
