import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/phc-portfolio-report.json';
export const metadata={title:'Project Homeless Connect — whole-gift research | GiveBetter'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/phc-portfolio-model">Inspect formulas, inputs and sources</a>. <a href="/api/sf-glasses-model">Historical program model</a>.</>}};return <CharityResearchReport content={content}/>;}
