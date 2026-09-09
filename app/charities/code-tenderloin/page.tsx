import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/code-tenderloin-report.json';
export const metadata={title:'Code Tenderloin — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/code-tenderloin-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
