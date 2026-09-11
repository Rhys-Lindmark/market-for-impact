import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/hif-report.json';
export const metadata={title:'Housing Industry Foundation — GiveBetter research',description:'Whole-cost housing prevention-health research; affordable housing, rehousing and renovations remain unquantified.'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/hif-model">Inspect the model, assumptions and scenarios</a>.</>}};return <CharityResearchReport content={content}/>;}
