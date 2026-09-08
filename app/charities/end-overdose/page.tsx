import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/us/end-overdose-report.json';
export const metadata={title:'End Overdose — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/end-overdose-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
