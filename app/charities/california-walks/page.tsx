import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/california/calwalks-report.json';
export const metadata={title:'California Walks — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/calwalks-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
