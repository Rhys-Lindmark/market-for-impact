import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/via-heart-report.json';
export const metadata={title:'Via Heart Project — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/via-heart-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
