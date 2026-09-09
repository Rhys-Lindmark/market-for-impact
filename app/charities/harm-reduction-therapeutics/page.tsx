import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/us/hrt-report.json';
export const metadata={title:'Harm Reduction Therapeutics — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/hrt-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
