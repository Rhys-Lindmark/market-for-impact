import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/us/next-distro-report.json';
export const metadata={title:'NEXT Distro — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/next-distro-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
