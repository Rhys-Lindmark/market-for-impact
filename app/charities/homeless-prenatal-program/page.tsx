import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/hpp-report.json';
export const metadata={title:'Homeless Prenatal Program — GiveBetter research'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/hpp-model">Inspect formulas, inputs and sources</a>.</>}};return <CharityResearchReport content={content}/>;}
