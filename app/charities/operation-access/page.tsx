import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/oa-portfolio-report.json';
export const metadata={title:'Operation Access — whole-organization research | GiveBetter'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/oa-portfolio-model">Inspect formulas, inputs and sources</a>. <a href="/api/sf-surgical-access-models">Historical selected-program models</a>.</>}};return <CharityResearchReport content={content}/>;}
