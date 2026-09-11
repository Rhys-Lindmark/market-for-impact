import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/san-francisco/sfaf-portfolio-report.json';
export const metadata={title:'San Francisco AIDS Foundation — research | GiveBetter'};
export default function Page(){const content:CharityReportContent={...report,nutshell:{...report.nutshell,body:<>{report.nutshell.body} <a href="/api/sfaf-portfolio-model">Inspect formulas, inputs and sources</a>. <a href="/api/sf-naloxone-model">Historical program model</a>.</>}};return <CharityResearchReport content={content}/>;}
