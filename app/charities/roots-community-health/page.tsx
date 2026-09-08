import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/roots-report.json';
export const metadata={title:'Roots Community Health — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/roots-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
