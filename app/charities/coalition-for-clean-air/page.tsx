import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/california/cca-report.json';
export const metadata={title:'Coalition for Clean Air — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/cca-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
